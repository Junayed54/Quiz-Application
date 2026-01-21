from collections import defaultdict
import pandas as pd
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.filters import SearchFilter

from .models import *
from .serializers import *
from quiz.permissions import IsTeacherOrAdmin


class WordOfTheDayAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        word = Word.today_word()

        if not word:
            return Response(
                {"detail": "No words available"},
                status=404
            )

        serializer = WordSerializer(word)
        return Response(serializer.data)


# GET /api/words/<id>/
class WordDetailAPIView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = WordSerializer
    lookup_field = "id"

    def get_queryset(self):
        return (
            Word.objects
            .select_related("language", "part_of_speech")
            .prefetch_related(
                "forms",
                "senses__definitions",
                "senses__examples",
                "senses__synonyms__word",
                "senses__antonyms__word",
            )
        )



# GET /api/words/az/
class WordAZAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = (
            Word.objects
            .select_related("part_of_speech", "language")
            .prefetch_related(
                "forms",
                "senses__definitions",
                "senses__examples",
                "senses__synonyms__word",
                "senses__antonyms__word",
            )
            .order_by("text")
        )

        grouped_words = defaultdict(list)

        for word in queryset:
            letter = word.text[0].upper()
            grouped_words[letter].append(
                WordSerializer(word).data
            )

        return Response(dict(sorted(grouped_words.items())))


# GET /api/words/search/?q=apple
class WordSearchAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip().lower()
        if not query:
            return Response([])

        words = Word.objects.filter(text__istartswith=query).order_by("text")[:20]

        if len(words) < 20:
            extra_words = Word.objects.filter(text__icontains=query).exclude(
                id__in=words.values_list("id", flat=True)
            )[:10]
            words = list(words) + list(extra_words)

        serializer = WordListSerializer(words, many=True)
        return Response(serializer.data)

import re
import pandas as pd

def extract_quoted_sentences(text):
    """
    Extract sentences wrapped in double quotes.
    Example:
    '"This is one." "This is two."' → ["This is one.", "This is two."]
    """
    if pd.isna(text):
        return []
    return re.findall(r'"(.*?)"', str(text))


class DictionaryExcelUploadAPIView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def post(self, request, language_id):
        serializer = DictionaryExcelUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        df = pd.read_excel(serializer.validated_data["file"])

        # 🔒 FIX LANGUAGE CONTEXT FROM URL
        try:
            language = Language.objects.get(id=language_id)
        except Language.DoesNotExist:
            return Response(
                {"detail": "Invalid language ID"},
                status=400
            )

        bn_language, _ = Language.objects.get_or_create(
            code="BN", defaults={"name": "Bangla"}
        )

        created_senses = 0
        errors = []

        for i, row in df.iterrows():
            try:
                # ---------- PART OF SPEECH ----------
                pos, _ = PartOfSpeech.objects.get_or_create(
                    name=str(row["pos"]).lower()
                )

                # ---------- WORD ----------
                word, _ = Word.objects.get_or_create(
                    language=language,
                    text=str(row["word"]).lower(),
                    part_of_speech=pos,
                    defaults={
                        "phonetic_uk": row.get("phonetic_uk", ""),
                        "phonetic_us": row.get("phonetic_us", "")
                    }
                )

                # ---------- SENSE ----------
                sense, created = Sense.objects.get_or_create(
                    word=word,
                    short_definition=row["short_definition"]
                )
                if created:
                    created_senses += 1

                # ---------- BANGLA MEANINGS ----------
                if pd.notna(row.get("bangla_meanings")):
                    for m in str(row["bangla_meanings"]).split(";"):
                        BanglaMeaning.objects.get_or_create(
                            sense=sense,
                            meaning=m.strip()
                        )

                # ---------- DEFINITIONS ----------
                Definition.objects.get_or_create(
                    sense=sense,
                    definition_text=row["short_definition"]
                )

                # ---------- EXAMPLES (MULTIPLE IN QUOTES) ----------
                examples = extract_quoted_sentences(row.get("examples"))
                bn_examples = extract_quoted_sentences(row.get("example_bn"))

                for idx, ex in enumerate(examples):
                    ex_obj, _ = ExampleSentence.objects.get_or_create(
                        sense=sense,
                        sentence=ex.strip()
                    )
                    if idx < len(bn_examples):
                        ExampleTranslation.objects.get_or_create(
                            example=ex_obj,
                            language=bn_language,
                            defaults={"translated_text": bn_examples[idx].strip()}
                        )

                # ---------- WORD FORMS ----------
                if pd.notna(row.get("forms")):
                    for f in str(row["forms"]).split(";"):
                        if ":" in f:
                            form, label = f.split(":", 1)
                            WordForm.objects.get_or_create(
                                word=word,
                                form=form.strip(),
                                label=label.strip()
                            )

                # ---------- SYNONYMS ----------
                if pd.notna(row.get("synonyms")):
                    for s in str(row["synonyms"]).split(";"):
                        syn_word, _ = Word.objects.get_or_create(
                            language=language,
                            text=s.strip().lower(),
                            part_of_speech=pos
                        )
                        Synonym.objects.get_or_create(
                            sense=sense,
                            word=syn_word
                        )

                # ---------- ANTONYMS ----------
                if pd.notna(row.get("antonyms")):
                    for a in str(row["antonyms"]).split(";"):
                        ant_word, _ = Word.objects.get_or_create(
                            language=language,
                            text=a.strip().lower(),
                            part_of_speech=pos
                        )
                        Antonym.objects.get_or_create(
                            sense=sense,
                            word=ant_word
                        )

            except Exception as e:
                errors.append({
                    "row": i + 2,
                    "error": str(e)
                })

        return Response({
            "language": language.name,
            "created_senses": created_senses,
            "errors": errors
        })

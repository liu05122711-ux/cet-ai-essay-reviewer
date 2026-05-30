import json
import re
from textwrap import shorten

import httpx

from app.core.config import get_settings
from app.schemas.essay import ReviewResult


SYSTEM_PROMPT = """You are an expert CET-4/CET-6 English writing examiner.
Return strict JSON only. Scores are integers. Highlight offsets must match the original essay character indexes.
Evaluate with reference to the recent decade of CET-4/CET-6 writing rubrics and real-question expectations:
global scoring, task relevance, completeness, clarity of ideas, organization, coherence, vocabulary range,
sentence control, grammar accuracy, and whether language errors affect communication."""


def _json_schema_hint() -> str:
    return """
{
  "scores": {
    "total": 0,
    "vocabulary": 0,
    "grammar": 0,
    "sentence_variety": 0,
    "coherence": 0,
    "task_completion": 0,
    "cet6_prediction": 0,
    "cet4_prediction": 0
  },
  "current_level": "A|B|C|D|E",
  "excellent_gap_analysis": [""],
  "improve_to_80": [""],
  "improve_to_90": [""],
  "highlights": [{"start": 0, "end": 1, "type": "grammar|spelling|style", "message": "", "suggestion": ""}],
  "grammar_errors": [{"text": "", "explanation": "", "suggestion": ""}],
  "spelling_errors": [{"text": "", "explanation": "", "suggestion": ""}],
  "advanced_expressions": [""],
  "vocabulary_replacements": [{"text": "", "explanation": "", "suggestion": ""}],
  "improvement_suggestions": [""],
  "polished_version": "",
  "high_score_sample": "",
  "optimized_translation": "",
  "version_80": "",
  "version_90": "",
  "full_score_sample": ""
}
"""


async def review_essay(text: str, prompt: str | None = None) -> ReviewResult:
    settings = get_settings()
    if settings.openai_api_key:
        try:
            return await _review_with_openai(text, prompt)
        except Exception:
            return _fallback_review(text, prompt)
    return _fallback_review(text, prompt)


async def _review_with_openai(text: str, prompt: str | None) -> ReviewResult:
    settings = get_settings()
    user_prompt = f"""
Essay prompt:
{prompt or "No prompt provided."}

Original essay:
{text}

Return JSON using this shape:
{_json_schema_hint()}
"""
    async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as client:
        response = await client.post(
            f"{settings.openai_base_url.rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"},
            json={
                "model": settings.openai_model,
                "temperature": 0.2,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "response_format": {"type": "json_object"},
            },
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        data = json.loads(content)
        return ReviewResult.model_validate(data)


def _fallback_review(text: str, prompt: str | None) -> ReviewResult:
    words = re.findall(r"[A-Za-z']+", text)
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    unique_ratio = len({w.lower() for w in words}) / max(len(words), 1)
    avg_sentence = len(words) / max(len(sentences), 1)

    grammar_issues = []
    spelling_issues = []
    highlights = []

    patterns = [
        (r"\bi am\b", "Capitalize the pronoun I.", "I am"),
        (r"\bmore better\b", "Avoid double comparatives.", "better"),
        (r"\bpeople is\b", "Use plural verb agreement with people.", "people are"),
        (r"\ba lot of informations\b", "Information is usually uncountable.", "a lot of information"),
        (r"\bin nowadays\b", "Use 'nowadays' without 'in'.", "Nowadays"),
    ]
    for pattern, message, suggestion in patterns:
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            issue = {"text": match.group(0), "explanation": message, "suggestion": suggestion}
            grammar_issues.append(issue)
            highlights.append(
                {"start": match.start(), "end": match.end(), "type": "grammar", "message": message, "suggestion": suggestion}
            )

    spelling_map = {"enviroment": "environment", "importent": "important", "becuase": "because", "frist": "first"}
    for wrong, right in spelling_map.items():
        for match in re.finditer(rf"\b{wrong}\b", text, flags=re.IGNORECASE):
            spelling_issues.append(
                {"text": match.group(0), "explanation": f"Possible spelling error. Use '{right}'.", "suggestion": right}
            )
            highlights.append(
                {
                    "start": match.start(),
                    "end": match.end(),
                    "type": "spelling",
                    "message": "Possible spelling error.",
                    "suggestion": right,
                }
            )

    vocab_score = min(100, max(45, int(55 + unique_ratio * 45)))
    grammar_score = max(45, 92 - len(grammar_issues) * 8 - len(spelling_issues) * 5)
    variety_score = 78 if 12 <= avg_sentence <= 24 else 65
    coherence_score = 78 + min(12, text.lower().count("therefore") * 3 + text.lower().count("however") * 3)
    task_score = 86 if len(words) >= 150 else 70 if len(words) >= 90 else 58
    total = int((vocab_score + grammar_score + variety_score + coherence_score + task_score) / 5)
    level = _level_for_score(total)

    topic = prompt or "the given topic"
    polished = _simple_polish(text)
    sample = (
        f"In response to {topic}, it is essential to approach the issue with both clarity and balance. "
        "A strong essay should present a clear standpoint, support it with concrete examples, and connect each paragraph "
        "through smooth transitions. By using precise vocabulary and varied sentence patterns, the writer can make the "
        "argument more convincing and suitable for CET writing standards."
    )
    version_80 = (
        f"{polished}\n\nTo reach a stronger CET level, the essay should make the thesis explicit, add one concrete example, "
        "and use transitions such as 'therefore', 'in addition', and 'as a result' to connect ideas naturally."
    )
    version_90 = (
        f"In the context of {topic}, effective English writing requires more than correct grammar; it also requires clear logic, "
        "specific support, and natural expression. Regular practice enables students to activate useful vocabulary, organize "
        "arguments with greater confidence, and identify weaknesses through timely feedback. More importantly, when learners "
        "revise their work after receiving comments, they gradually develop a sharper awareness of accuracy, coherence, and style. "
        "Therefore, college students should regard writing practice as a long-term process rather than a last-minute task."
    )
    full_score = (
        f"{topic} is a meaningful topic for today's college students. In my view, strong English writing is built on three elements: "
        "a focused argument, convincing evidence, and fluent expression. First, a focused argument helps readers understand the "
        "writer's position from the beginning. Second, relevant examples from campus life or social experience make the discussion "
        "more persuasive. Finally, accurate grammar and varied sentence patterns allow ideas to be delivered clearly and naturally. "
        "Although many students rely on templates, real improvement comes from repeated practice, careful revision, and thoughtful "
        "feedback. Only in this way can they turn simple opinions into mature and well-organized writing."
    )

    return ReviewResult.model_validate(
        {
            "scores": {
                "total": total,
                "vocabulary": vocab_score,
                "grammar": grammar_score,
                "sentence_variety": variety_score,
                "coherence": min(100, coherence_score),
                "task_completion": task_score,
                "cet6_prediction": min(710, int(total / 100 * 710)),
                "cet4_prediction": min(710, int((total + 6) / 100 * 710)),
            },
            "current_level": level,
            "excellent_gap_analysis": [
                "Compared with an excellent CET essay, the current essay needs a sharper thesis and more specific supporting examples.",
                "Vocabulary is understandable but could be more precise and academic.",
                "Sentence patterns should include more natural complex sentences rather than repeated simple structures.",
                "Paragraph logic needs clearer transitions and a stronger concluding sentence.",
            ],
            "improve_to_80": [
                "State the central argument clearly in the introduction.",
                "Add at least two concrete examples or reasons related to the prompt.",
                "Correct visible grammar and spelling mistakes that may affect communication.",
                "Use basic transitions to make paragraph development easier to follow.",
            ],
            "improve_to_90": [
                "Make the argument more nuanced by acknowledging a contrast or limitation.",
                "Use precise academic collocations and avoid vague words such as good, many, and important.",
                "Combine simple sentences into controlled complex sentences where appropriate.",
                "Ensure each paragraph has a clear function: thesis, support, extension, conclusion.",
                "End with a concise, memorable conclusion that reinforces the writer's position.",
            ],
            "highlights": highlights[:12],
            "grammar_errors": grammar_issues[:8],
            "spelling_errors": spelling_issues[:8],
            "advanced_expressions": [
                "play a pivotal role in",
                "from a long-term perspective",
                "strike a balance between ... and ...",
                "give rise to profound changes",
            ],
            "vocabulary_replacements": [
                {"text": "good", "explanation": "Use a more specific adjective.", "suggestion": "beneficial / impressive"},
                {"text": "important", "explanation": "Choose a more academic expression.", "suggestion": "significant / essential"},
                {"text": "many", "explanation": "Use a formal quantifier.", "suggestion": "numerous / a considerable number of"},
            ],
            "improvement_suggestions": [
                "Add a clear thesis sentence in the first paragraph.",
                "Use examples from campus life or society to support major claims.",
                "Vary sentence openings and include complex sentences where natural.",
                "End with a concise conclusion that echoes the central argument.",
            ],
            "polished_version": polished,
            "high_score_sample": sample,
            "optimized_translation": "本文观点基本清晰。建议在中文思路上先明确论点、分论点和例证，再用更正式的英语表达展开。",
            "version_80": version_80,
            "version_90": version_90,
            "full_score_sample": full_score,
        }
    )


def _simple_polish(text: str) -> str:
    result = text.strip()
    replacements = {
        "more better": "better",
        "people is": "people are",
        "a lot of informations": "a lot of information",
        "in nowadays": "Nowadays",
        "i am": "I am",
        "enviroment": "environment",
        "importent": "important",
        "becuase": "because",
    }
    for old, new in replacements.items():
        result = re.sub(re.escape(old), new, result, flags=re.IGNORECASE)
    if len(result) < 80:
        result = f"{result} This idea can be further developed with clearer examples and smoother transitions."
    return shorten(result, width=3500, placeholder="...")


def _level_for_score(score: int) -> str:
    if score >= 90:
        return "A 档：接近满分，内容充分、语言自然、结构严谨"
    if score >= 80:
        return "B 档：优秀，表达清楚，少量语言或深度不足"
    if score >= 70:
        return "C 档：良好，基本切题，仍需提升准确性和连贯性"
    if score >= 60:
        return "D 档：及格边缘，能表达主要意思但错误和展开不足较明显"
    return "E 档：基础薄弱，需优先解决切题、结构和基础语法问题"

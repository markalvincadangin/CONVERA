"""
Free Academic & Regional Web Research Client for RatchetAI
Integrates zero-cost, open-access academic and regional research APIs:
1. OpenAlex API (250M+ scholarly works, DOIs, open-access PDFs, zero API key)
2. Europe PMC / PubMed REST API (biomedical, agricultural, life sciences)
3. DuckDuckGo Regional News Engine (Panay News, Daily Guardian, Visayan Daily Star)
"""

import re
import urllib.parse
from typing import Any, Dict, List, Optional
import httpx

USER_AGENT = "RatchetAI-Technopreneurship/1.0 (mailto:incubator@ratchetai.local)"

STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "of", "from", "up", "about", "into", "over", "after", "is", "are", "was",
    "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "due",
    "than", "too", "very", "can", "will", "just", "should", "now", "complete", "sudden",
    "cannot", "their", "they", "them", "which", "what", "where", "when", "there"
}


def extract_keywords(text: str, max_words: int = 5) -> str:
    tokens = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
    filtered = [t for t in tokens if t not in STOP_WORDS]
    return " ".join(filtered[:max_words])


class FreeResearchClient:
    def __init__(self, timeout: float = 12.0):
        self.timeout = timeout

    async def search_academic_openalex(
        self, query: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search OpenAlex for open-access peer-reviewed literature and working DOIs.
        Free, non-profit API (OurResearch).
        """
        clean_q = extract_keywords(query, max_words=6) or query.strip()
        if not clean_q:
            return []

        url = "https://api.openalex.org/works"
        params = {
            "search": clean_q,
            "per-page": min(limit, 10),
        }
        headers = {"User-Agent": USER_AGENT}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, params=params, headers=headers)
                if res.status_code != 200:
                    return []
                data = res.json()

            results = []
            for work in data.get("results", []):
                title = work.get("title")
                if not title:
                    continue

                doi = work.get("doi")
                oa_url = work.get("open_access", {}).get("oa_url") or doi
                year = work.get("publication_year")

                # Extract authors
                authorships = work.get("authorships", [])
                authors = [
                    a.get("author", {}).get("display_name")
                    for a in authorships[:3]
                    if a.get("author", {}).get("display_name")
                ]
                author_str = ", ".join(authors) + (" et al." if len(authorships) > 3 else "")

                # Host venue / journal
                source_loc = work.get("primary_location", {}) or {}
                source_meta = source_loc.get("source", {}) or {}
                venue = source_meta.get("display_name") or "Peer-Reviewed Journal"

                results.append({
                    "engine": "OPENALEX",
                    "source_name": f"{venue} ({year or 'Recent'})",
                    "title": title,
                    "source_url": doi or oa_url or f"https://openalex.org/{work.get('id', '')}",
                    "doi": doi,
                    "oa_pdf_url": oa_url,
                    "authors": author_str or "Academic Researchers",
                    "venue": venue,
                    "year": str(year) if year else "Recent",
                    "cited_by_count": work.get("cited_by_count", 0),
                    "source_tier": "A",
                    "quote_or_summary": f"Peer-reviewed study by {author_str or 'researchers'} published in {venue} ({year or 'N/A'}). Cited by {work.get('cited_by_count', 0)} papers.",
                })
            return results
        except Exception as err:
            print(f"[!] OpenAlex search error: {err}")
            return []

    async def search_europe_pmc(
        self, query: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search Europe PMC / PubMed for agricultural, life sciences, healthcare, and biotech papers.
        Free public REST API.
        """
        clean_q = extract_keywords(query, max_words=5) or query.strip()
        if not clean_q:
            return []

        url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
        params = {
            "query": clean_q,
            "format": "json",
            "pageSize": min(limit, 10),
            "resultType": "lite",
        }
        headers = {"User-Agent": USER_AGENT}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, params=params, headers=headers)
                if res.status_code != 200:
                    return []
                data = res.json()

            results = []
            for item in data.get("resultList", {}).get("result", []):
                title = item.get("title", "").rstrip(".")
                if not title:
                    continue

                doi_raw = item.get("doi")
                doi_url = f"https://doi.org/{doi_raw}" if doi_raw else None
                pmcid = item.get("pmcid")
                article_url = doi_url or (f"https://europepmc.org/articles/{pmcid}" if pmcid else None) or f"https://europepmc.org/abstract/MED/{item.get('id', '')}"
                journal = item.get("journalTitle") or "Life Sciences Journal"
                year = item.get("pubYear")
                authors = item.get("authorString") or "Research Team"

                results.append({
                    "engine": "EUROPE_PMC",
                    "source_name": f"{journal} ({year or 'Recent'})",
                    "title": title,
                    "source_url": article_url,
                    "doi": doi_url,
                    "authors": authors,
                    "venue": journal,
                    "year": str(year) if year else "Recent",
                    "source_tier": "A",
                    "quote_or_summary": f"Scientific research published in {journal} ({year or 'Recent'}) by {authors[:50]}.",
                })
            return results
        except Exception as err:
            print(f"[!] Europe PMC search error: {err}")
            return []

    async def search_regional_news(
        self, query: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search regional Philippine news outlets (Panay News, Daily Guardian, Visayan Daily Star, Rappler, Inquirer).
        """
        keywords = extract_keywords(query, max_words=5) or query.strip()
        if not keywords:
            return []

        search_query = f"{keywords} (site:panaynews.net OR site:dailyguardian.com.ph OR site:visayandailystar.com OR site:inquirer.net OR site:rappler.com OR Iloilo)"
        url = "https://html.duckduckgo.com/html/"
        data = {"q": search_query}
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                res = await client.post(url, data=data, headers=headers)
                if res.status_code != 200:
                    return []
                html = res.text

            results = []
            matches = re.findall(
                r'<a class="result__url"[^>]*href="([^"]+)"[^>]*>\s*([^\s<]+)', html
            )
            snippets = re.findall(
                r'<a class="result__snippet"[^>]*href="[^"]*"[^>]*>(.*?)</a>',
                html,
                re.DOTALL,
            )

            for idx, m in enumerate(matches[:limit]):
                raw_url = m[0]
                if "uddg=" in raw_url:
                    actual_url = urllib.parse.unquote(raw_url.split("uddg=")[1].split("&")[0])
                else:
                    actual_url = raw_url

                domain_display = m[1].replace("www.", "")
                snippet_text = re.sub(r"<[^>]+>", "", snippets[idx]).strip() if idx < len(snippets) else ""

                source_name = f"Regional News ({domain_display})"
                if "panaynews" in actual_url.lower():
                    source_name = "Panay News"
                elif "dailyguardian" in actual_url.lower():
                    source_name = "Daily Guardian"
                elif "visayandailystar" in actual_url.lower():
                    source_name = "Visayan Daily Star"
                elif "psa.gov.ph" in actual_url.lower():
                    source_name = "Philippine Statistics Authority"

                results.append({
                    "engine": "REGIONAL_NEWS",
                    "source_name": source_name,
                    "title": snippet_text[:90] or f"Coverage from {domain_display}",
                    "source_url": actual_url,
                    "authors": domain_display,
                    "venue": domain_display,
                    "year": "Recent",
                    "source_tier": "B" if "gov.ph" not in actual_url else "A",
                    "quote_or_summary": snippet_text or f"Regional news and empirical coverage from {domain_display}.",
                })

            return results
        except Exception as err:
            print(f"[!] Regional News search error: {err}")
            return []

    async def auto_research_problem(
        self, problem: Dict[str, Any]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Perform multi-source parallel empirical evidence gathering for a specific problem.
        """
        statement = problem.get("problem_statement") or ""
        sector = problem.get("sector") or ""
        location = problem.get("sufferer_location") or "Iloilo"
        occupation = problem.get("sufferer_occupation") or ""

        # Extract focused keywords
        statement_kw = extract_keywords(statement, max_words=4)
        occ_kw = extract_keywords(occupation, max_words=2)
        
        academic_query = f"{sector} {occ_kw} {statement_kw}".strip()
        regional_query = f"Iloilo {occ_kw} {statement_kw}".strip()

        openalex_results = await self.search_academic_openalex(academic_query, limit=3)
        europe_pmc_results = await self.search_europe_pmc(academic_query, limit=3)
        regional_results = await self.search_regional_news(regional_query, limit=4)

        return {
            "openalex": openalex_results,
            "europe_pmc": europe_pmc_results,
            "regional_news": regional_results,
            "all_combined": openalex_results + europe_pmc_results + regional_results,
        }

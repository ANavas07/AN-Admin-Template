// Search and feedback over the knowledge base articles.
import { normalizeText } from '../../utils/text'
import { createLocalStore, isRecord } from '../storage/localStore'
import { ARTICLES } from './articles'
import type { Article } from './articles'

/**
 * Articles matching every word of the query, best first: a word in the title
 * weighs more than in the tags, the summary or the body.
 */
export function searchArticles(query: string, categoryId?: string, articles: Article[] = ARTICLES): Article[] {
    const words = normalizeText(query).split(/\s+/).filter((word) => word.length > 1)
    const inCategory = categoryId ? articles.filter((article) => article.categoryId === categoryId) : articles
    if (words.length === 0) return inCategory

    return inCategory
        .map((article) => {
            const fields = [
                [normalizeText(article.title), 5],
                [normalizeText(article.tags.join(' ')), 3],
                [normalizeText(article.summary), 2],
                [normalizeText(article.body), 1],
            ] as const
            let score = 0
            for (const word of words) {
                const wordScore = fields.reduce((total, [text, weight]) => (text.includes(word) ? total + weight : total), 0)
                if (wordScore === 0) return null
                score += wordScore
            }
            return { article, score }
        })
        .filter((result): result is { article: Article; score: number } => result !== null)
        .sort((a, b) => b.score - a.score)
        .map((result) => result.article)
}

export type ArticleVote = 'helpful' | 'not_helpful'

const feedbackStore = createLocalStore<Record<string, ArticleVote>>({
    namespace: 'knowledge-base:feedback:v1',
    seed: () => ({}),
    parse: (raw) => (isRecord(raw) ? (raw as Record<string, ArticleVote>) : null),
})

export const knowledgeBaseService = {
    getVote(userId: string, slug: string): ArticleVote | null {
        return feedbackStore.read(userId)[slug] ?? null
    },
    async vote(userId: string, slug: string, vote: ArticleVote): Promise<void> {
        feedbackStore.update((votes) => ({ ...votes, [slug]: vote }), userId)
    },
}

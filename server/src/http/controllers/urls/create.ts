import { InvalidUrlFormatError } from '@/use-cases/errors/invalid-url-format-error'
import { UrlAlreadyExistsError } from '@/use-cases/errors/url-already-exists-error'
import { makeCreateUrlUseCase } from '@/use-cases/factories/make-create-url-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createUrlBodySchema = z.object({
    originalUrl: z.string().url(),
    shortenedUrl: z.string().url(),
  })

  const { originalUrl, shortenedUrl } = createUrlBodySchema.parse(request.body)

  try {
    const createUseCase = makeCreateUrlUseCase()

    await createUseCase.execute({ originalUrl, shortenedUrl })
  } catch (err) {
    if (err instanceof InvalidUrlFormatError) {
      return reply.status(400).send({ message: err.message })
    }

    if (err instanceof UrlAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }

  return reply.status(201).send()
}

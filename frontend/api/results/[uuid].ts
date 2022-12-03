import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function (req: VercelRequest, res: VercelResponse) {
  console.log(req.method);
  console.log(req.query.uuid);
  // const { value } = req.body;
  const resultId = req.query.uuid as string;
  if (req.method === 'GET') {
    const result = await prisma.result.findFirst({
      where: { id: resultId },
    });
    return res.json(result);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

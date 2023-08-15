import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const propertyRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        state: z.string(),
        pageNumber: z.number(),
        pageSize: z.number(),
        orderByField: z.union([z.string(), z.undefined()]),
        orderByDirection: z.union([z.string(), z.undefined()]),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.state ? { state: input.state } : {};
      const totalCount = await ctx.prisma.property.count({ where });
      const properties = await ctx.prisma.property.findMany({
        where,
        skip: (input.pageNumber - 1) * input.pageSize,
        take: input.pageSize,
        orderBy:
          input.orderByField && input.orderByDirection
            ? { [input.orderByField]: input.orderByDirection }
            : undefined,
      });

      return { totalCount, properties };
    }),
  getPropertyDetail: publicProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.property.findUnique({
        where: { id: input.propertyId },
        include: {
          comments: true,
        },
      });
    }),
  likeProperty: publicProcedure
    .input(z.object({ propertyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: input.propertyId,
        },
      });

      if (property) {
        const updatedProperty = await ctx.prisma.property.update({
          where: { id: input.propertyId },
          data: {
            likesCount: property.likesCount + 1,
          },
        });

        console.log("Incrementing likesCount", { updatedProperty });
      } else {
        throw new Error("Property not found");
      }
    }),
  dislikeProperty: publicProcedure
    .input(z.object({ propertyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: input.propertyId,
        },
      });

      if (property) {
        const updatedProperty = await ctx.prisma.property.update({
          where: { id: input.propertyId },
          data: {
            likesCount: property.likesCount - 1,
          },
        });

        console.log("Decrementing likesCount", { updatedProperty });
      } else {
        throw new Error("Property not found");
      }
    }),
  commentOnProperty: publicProcedure
    .input(z.object({ propertyId: z.number(), commentContent: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: input.propertyId,
        },
      });

      if (property) {
        const createdComment = await ctx.prisma.comment.create({
          data: {
            content: input.commentContent,
            Property: {
              connect: { id: input.propertyId },
            },
          },
        });

        await ctx.prisma.property.update({
          where: { id: input.propertyId },
          data: {
            commentsCount: property.commentsCount + 1,
          },
        });

        console.log("Creating comment", { createdComment });
      } else {
        throw new Error("Property not found");
      }
    }),
});

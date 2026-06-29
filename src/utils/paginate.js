/**
 * paginate — reusable pagination helper for any Mongoose model.
 *
 * @param {Model}  model   — Mongoose model to query
 * @param {Object} filter  — MongoDB filter object e.g. { channelId, isDeleted: false }
 * @param {Object} options — { page, limit, sort, populate }
 *
 * @returns {Object} { data, meta: { total, page, limit, total_pages } }
 *
 * Usage:
 *   const result = await paginate(Message, { channelId, isDeleted: false }, {
 *     page,
 *     limit,
 *     sort:     { createdAt: -1 },
 *     populate: { path: "senderId", select: "name email" },
 *   });
 */
const paginate = async (model, filter, options = {}) => {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  let query = model.find(filter).skip(skip).limit(limit);

  if (options.sort) query = query.sort(options.sort);
  if (options.populate) query = query.populate(options.populate);

  const [data, total] = await Promise.all([
    query,
    model.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  };
};

module.exports = paginate;

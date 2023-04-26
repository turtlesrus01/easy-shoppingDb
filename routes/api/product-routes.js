const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

//error messages
const ERR_MESSAGES = {
  FIND_ERROR: 'Error finding product',
  PRODUCT_404: 'Product not found.',
  INVALID: 'Invalid product id.'
};

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const product = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ['id', 'category_name']
        },
        {
          model: Tag,
          attributes: ['id', 'tag_name'],
          through: ProductTag,
          as: 'product_tags'
        }
      ]
    });
    res.status(200).json(product)
  } catch (err) {
    console.error(err);
    res.status(500).json(ERR_MESSAGES.FIND_ERROR);
  }
  // be sure to include its associated Category and Tag data
});

// get one product
router.get('/:id', async (req, res) => {
  //validate id
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).send(ERR_MESSAGES.INVALID);
  }
  
  // find a single product by its `id`
  try {
    const product = await findProdById(id, {
      include: [
        {
          model: Category,
          attributes: ['id', 'category_name']
        },
        {
          model: Tag,
          attributes: ['id', 'tag_name'],
          through: ProductTag,
          as: 'product_tags'
        }
      ]
    });    
    res.status(200).json(product)
  } catch (err) {
    console.error(err);
    res.status(500).json({message: ERR_MESSAGES.FIND_ERROR});
  }

  // be sure to include its associated Category and Tag data
});

//function to carry out db query
async function findProdById (id) {
  const product = await Product.findByPk(id, {
    //join with categories
    include: [{model: Product, as: 'category_products'}]
  });

  if (!product) {
    throw new Error(ERR_MESSAGES.CATEGORY_404);
  }

  return product;
}

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if  (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then(() => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  //validate id
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).send(ERR_MESSAGES.INVALID);
  }

  // delete one product by its `id` value
  try {
    const category = await Product.destroy({
      where: {
        id: req.params.id
      }
    });
    //validate if the category exists
    if (!category) {
      res.status(404).send(ERR_MESSAGES.CATEGORY_404)
    }
    res.status(200).json({message: 'Product successfully deleted.'});
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;

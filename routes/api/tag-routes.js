const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

//error messages
const ERR_MESSAGES = {
  FIND_ERROR: 'Error finding tag',
  PRODUCT_404: 'Tag not found.',
  INVALID: 'Invalid tag id.'
};

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  try {
    const tag = await Tag.findAll({
      include: [
        {
          model: Tag,
          attributes: ['id', 'tag_name'],
        }
      ]
    });
    res.status(200).json(tag)
  } catch (err) {
    console.error(err);
    res.status(500).json(ERR_MESSAGES.FIND_ERROR);
  }
  // be sure to include its associated Product data
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  //validate id
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).send(ERR_MESSAGES.INVALID);
  }
  
  // find a single product by its `id`
  try {
    const product = await findTagById(id, {
      include: [
        {
          model: Tag,
          attributes: ['id', 'tag_name'],
        }
      ]
    });    
    res.status(200).json(product)
  } catch (err) {
    console.error(err);
    res.status(500).json({message: ERR_MESSAGES.FIND_ERROR});
  }
  // be sure to include its associated Product data
});

//function to carry out db query
async function findTagById (id) {
  const tag = await Tag.findByPk(id, {
    //join with categories
    include: [{model: Tag, as: 'category_products'}]
  });

  if (!tag) {
    throw new Error(ERR_MESSAGES.CATEGORY_404);
  }

  return tag;
}

router.post('/', (req, res) => {
  // create a new tag
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;

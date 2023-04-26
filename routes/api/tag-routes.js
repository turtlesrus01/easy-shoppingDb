const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

//error messages
const ERR_MESSAGES = {
  FIND_ERROR: 'Error finding tag',
  TAG_404: 'Tag not found.',
  INVALID: 'Invalid tag id.'
};

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  try {
    const tag = await Tag.findAll({
      include: [
        {
          model: Product,
          attributes: ['id', 'product_name'],
          as: 'tagged_products'
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
    const product = await findTagById(id);    
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
    include: [
      {
        model: Product,
        attributes: ['id', 'product_name'],
        as: 'tagged_products'
      }
    ]
  });
  //Error handler for a missing tag
  if (!tag) {
    throw new Error(ERR_MESSAGES.TAG_404);
  }
  return tag;
}

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const tag = await Tag.create(req.body);
    //validate if the category exists
    if (!tag) {
      throw new Error(ERR_MESSAGES.TAG_404);
    }
    res.status(200).json(tag);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  //validate id
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).send(ERR_MESSAGES.INVALID);
  }
  // update a tag's name by its `id` value
  try {
    const tag = await Tag.update(req.body, {
      where: {
        id: req.params.id
      }
    });
    //validate if the category exists
    if (!tag) {
      res.status(404).send(ERR_MESSAGES.TAG_404)
    }
    res.status(200).json(tag);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
    //validate id
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).send(ERR_MESSAGES.INVALID);
    }
  // delete on tag by its `id` value
  try {
    const tag = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });
    //validate if the category exists
    if (!tag) {
      res.status(404).send(ERR_MESSAGES.TAG_404)
    }
    res.status(200).json({message: 'Tag successfully deleted.'});
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;

const router = require('express').Router();
const { Category, Product } = require('../../models');

//error messages
const ERR_MESSAGES = {
  FIND_ERROR: 'Error finding category',
  CATEGORY_404: 'Category not found.',
  INVALID: 'Invalid category id.'
};

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories)
  } catch (err) {
    console.error(err);
    res.status(500).json(ERR_MESSAGES.FIND_ERROR);
  }
  // be sure to include its associated Products
});

router.get('/:id', async (req, res) => {
  //validate id
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).send(ERR_MESSAGES.INVALID);
  }

  // find one category by its `id` value
  try {
    const category = await findCatById(id);    
    res.status(200).json(category)
  } catch (err) {
    console.error(err);
    res.status(500).json({message: ERR_MESSAGES.FIND_ERROR});
  }
  // be sure to include its associated Products
});

//function to carry out db query
async function findCatById (id) {
  const category = await Category.findByPk(id, {
    //join with categories
    include: [
      {
        model: Product, 
        attributes: ['id', 'product_name']
      }
    ]
  });
  //validate if the category exists
  if (!category) {
    throw new Error(ERR_MESSAGES.CATEGORY_404);
  }
  return category;
}

router.post('/', async (req, res) => {
  // create a new category
  try {
    const category = await Category.create(req.body);
    //validate if the category exists
    if (!category) {
      throw new Error(ERR_MESSAGES.CATEGORY_404);
    }
    res.status(200).json(category);
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
  // update a category by its `id` value
  try {
    const category = await Category.update(req.body, {
      where: {
        id: req.params.id
      }
    });
    //validate if the category exists
    if (!category) {
      res.status(404).send(ERR_MESSAGES.CATEGORY_404)
    }
    res.status(200).json(category);
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

  // delete a category by its `id` value
  try {
    const category = await Category.destroy({
      where: {
        id: req.params.id
      }
    });
    //validate if the category exists
    if (!category) {
      res.status(404).send(ERR_MESSAGES.CATEGORY_404)
    }
    res.status(200).json({message: 'Category successfully deleted.'});
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;

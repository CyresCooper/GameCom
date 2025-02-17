const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment, Helpful, Unhelpful } = require('../models');

router.get('/', (req, res) => {
  console.log('======================');
  Post.findAll({
    attributes: [
      'id',      
      'title',
      'game_name',
      'description',
      'created_at',
      [sequelize.literal('(SELECT COUNT(*) FROM helpful WHERE post.id = helpful.post_id)'), 'helpful_count'],
      [sequelize.literal('(SELECT COUNT(*) FROM unhelpful WHERE post.id = unhelpful.post_id)'), 'unhelpful_count']
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username']
        }
      },
      {
        model: User,
        attributes: ['username']
      }
    ]
  })
    .then(dbPostData => {
      const posts = dbPostData.map(post => post.get({ plain: true }));

      res.render('homepage', {
        posts,
        loggedIn: req.session.loggedIn
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/post/:id', (req, res) => {
  Post.findOne({
      where: {
          id: req.params.id
        },
        attributes: [
          'id',
          'title',
          'game_name',
          'description',
          'created_at',
          [sequelize.literal('(SELECT COUNT(*) FROM helpful WHERE post.id = helpful.post_id)'), 'helpful_count'],
          [sequelize.literal('(SELECT COUNT(*) FROM unhelpful WHERE post.id = unhelpful.post_id)'), 'unhelpful_count']
        ],
        include: [
          {
            model: Comment,
            attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
            include: {
              model: User,
              attributes: ['username']
            }
          },
          {
            model: User,
            attributes: ['username']
          }
      ]
  })
    .then(dbPostData => {
          if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
          }
          const post = dbPostData.get({ plain: true });

          res.render('single-post', {
          post,
          loggedIn: req.session.loggedIn
          });
      })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
})

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }

  res.render('login');
});

module.exports = router;
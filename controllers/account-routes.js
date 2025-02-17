const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment, Helpful, Unhelpful} = require('../models');
const withAuth = require('../utils/auth');

router.get('/', withAuth, (req, res) => {
    Post.findAll({
      where: {
        // use the ID from the session
        user_id: req.session.user_id
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
        // serialize data before passing to template
        const posts = dbPostData.map(post => post.get({ plain: true }));
        res.render('account', { posts, loggedIn: true });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.get('/edit/:id', withAuth, (req, res) => {
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
  
            res.render('edit-post', 
             {
             post,
             loggedIn: true
             }
            );
        })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
})

module.exports = router;
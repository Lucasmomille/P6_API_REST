const Sauce = require('../models/sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  console.log(sauceObject);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {
  const like = req.body.like;
  const UserId = req.body.userId;
  


  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      switch(like){
        case 0:
          Sauce.findOne({_id:req.params.id})
          .then(sauce => {
            if(sauce.usersLiked.includes(UserId)){
              Sauce.updateOne(
                {_id:req.params.id},
                {$pull: {usersLiked: UserId}, $inc: {likes: -1, dislikes: 0}}
              )
            .then(() => res.status(200).json(sauce))
            .catch(error => res.status(400).json({ error }));
            } else if (sauce.usersDisliked.includes(UserId)) {
              Sauce.updateOne(
                {_id:req.params.id},
                {$pull: {usersDisliked: UserId}, $inc: {likes: 0, dislikes: -1}}
              ).then(() => res.status(200).json(sauce))
              .catch(error => res.status(400).json({ error }));
            }else{
              res.status(400).json({ "error" : "can't find reference" })
            }
          })
        break;
        case 1:
          Sauce.updateOne(
            {_id:req.params.id},
            {$push: {usersLiked: UserId}, $inc: {likes: +1, dislikes: 0}}
          )
        .then(() => res.status(200).json({message: "Sauce likée"}))
        .catch(error => res.status(400).json({ error }));
        break;
        case -1:
          Sauce.updateOne(
            {_id:req.params.id},
            {$push: {usersDisliked: UserId}, $inc: {dislikes: +1, likes: 0}}
          )
        .then(() => res.status(200).json({message: "Sauce dislikée"}))
        .catch(error => res.status(400).json({ error }));
        break;     
      }      
    })
}

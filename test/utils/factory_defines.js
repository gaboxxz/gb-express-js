const { user, albumsByUser } = require('../../app/models/');
const helpers = require('../../app/helpers');
const { factory } = require('factory-girl');

factory.define(
  'user',
  user,
  {
    firstName: factory.chance('name', { middle: true }),
    lastName: factory.chance('name', { middle: true }),
    email: factory.chance('email', { domain: 'wolox.com' }),
    password: factory.chance('string', { length: 8 })
  },
  {
    afterBuild: model => {
      model.password = helpers.hashPassword(model.password);
      return model;
    }
  }
);

factory.define('albumsByUser', albumsByUser, {
  userId: factory.assocMany('user', 'id'),
  albumId: null,
  albumTitle: factory.chance('sentence')
});

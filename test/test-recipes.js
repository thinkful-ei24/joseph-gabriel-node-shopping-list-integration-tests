const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, runServer, closeServer } = require('../server');
const expect = chai.expect;
chai.use(chaiHttp);

describe('/recipes', function() {
  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });

  it('returns recipes on GET', function() {
    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');

        expect(res.body.length).to.be.at.least(1);

        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  it('creates a recipe on POST', function() {
    const newRecipe = {
      name: 'chicken dinner',
      ingredients: ['chicken', 'dinner']
    };

    return chai
      .request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'name', 'ingredients');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(
          Object.assign(newRecipe, { id: res.body.id })
        );
      });
  });

  it('updates a recipe on PUT', function() {
    const updateData = {
      name: 'updated name',
      ingredients: 'potato, tomato, salt'
    };

    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;

        return chai
          .request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });

  it('delete a recipe on DELETE', function() {
    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        return chai.request(app).delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});

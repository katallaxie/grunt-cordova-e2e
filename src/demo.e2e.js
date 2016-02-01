module.exports = {
  'Test': function (client) {
    var helloWorld = client.page.test();

    helloWorld.navigate()
      .assert.title('Hello World')
      .assert.visible('@search')
      .setValue('@search', 'nightwatch')
      .click('@submit');

    client.end();
  }
};

AJADE
=====

> Asynchronous-Rendering Jade Template Engine.


Usage (RequireJS)
-----------------

Install:

    bower install ajade


Usage example:

    define([
        '/path/to/ajade/index',
        '/path/to/master_template.jade',
    ], function(
        aJade,
        tpl
    ) {

        // tpl can be either jade source template or server side compiled
        // render function. But in this case you will also need Jade-Runtime
        // environment available.

        var targetPage = $(".someSelector"); // jQuery

        aJade.aRender(
            targetPage
            , locationTemplate
            , {lid: lid}
        );

    });



Sample template
---------------

    script(type="ajade" data-src="/path/to/some/api/function?someParameter="+someVar).
      div.fooClass(data-foo="foo attribute")
        before
          h2="aJade test"
          p Loading...
        then
          h2="aJade test"
          ul
            each row in data
              li=row.description
        catch
          h2 aJade test Error
            p=err



<a name="contributing"></a>Contributing
---------------------------------------

If you are interested in contributing with this project, you can do it in many ways:

  * Creating and/or mantainig documentation.

  * Implementing new features or improving code implementation.

  * Reporting bugs and/or fixing it.
  
  * Sending me any other feedback.

  * Whatever you like...
    
Please, contact-me, open issues or send pull-requests thought [this project GIT repository](https://github.com/bitifet/ajade)



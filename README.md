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

    div
      h1 Ajade Example
        p This part will be displayed immediately
    script(type="ajade" data-src="/path/to/some/api/function?someParameter="+someVar).
      div.fooClass(data-foo="foo attribute")
        before
          h2="aJade test"
          p Loading dynamic contents...
        then
          h2="aJade test"
          ul
            each row in data
              li=row.description
        catch
          h2 aJade test Error
            p=err
    // script (type="ajade" ...)
        // script (type="ajade" ...) // Even recursive...



Notes
-----
  * You can define as much dynamic blocks as you want.
    * Even recursively...
  * Each one will receive two locals:
    * data: with the results of the request.
    * model: Empty object by default. But you can use
      * `data-model` attribute (on the *script* tag, for a default model.
      * `data-models`, for `{before: before_model, then: then_model, catch: catch_model}`.
  * API url is expected to return JSON data.
    - But, if html response received, *then-teplate* is ignored and received
    html is inserted instead. At developing time, this is very useful, for
    example, with html output filters of
    [PASAR](https://www.npmjs.com/package/pasar) APIs.



<a name="contributing"></a>Contributing
---------------------------------------

If you are interested in contributing with this project, you can do it in many ways:

  * Creating and/or mantainig documentation.

  * Implementing new features or improving code implementation.

  * Reporting bugs and/or fixing it.
  
  * Sending me any other feedback.

  * Whatever you like...
    
Please, contact-me, open issues or send pull-requests thought [this project GIT repository](https://github.com/bitifet/ajade)



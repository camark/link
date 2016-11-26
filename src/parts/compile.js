
/**
 * expr[string] is directive attribute value in the DOM, it could be a simple watch or watch(es) expr;
 *  */
function getLinkContext(el, directive, expr) {
  var linkContext;

  if (isWatch(expr)) {
    //expr is a watch
    linkContext = LinkContext.create(el, expr, directive);
    linkContextCollection.push(linkContext);
    addWatchFn(linkContext);
    if (directive === 'x-model') {
      bindModelListener(linkContext);
    }
  } else {
    var exprWatches = [];
    each(allWatches, function (watch) {
      if (expr.indexOf(watch) > -1) {
        exprWatches.push(watch);
      }
    });

    linkContext = LinkContext.create(el, exprWatches, directive, expr);
    linkContextCollection.push(linkContext);
    addWatchFn(linkContext);
  }
}

function getLinkContextsFromInterpolation(el, tpl) {
  var props = getInterpolationWatch(tpl),
    linkContext;
  if (props.length > 0) {
    linkContext = LinkContext.create(el, props, 'x-bind', null, tpl);
    linkContextCollection.push(linkContext);
    addWatchFn(linkContext);
  }
}

/**
   * 1. get directives and build linkContext context info.
   * 2. when it's x-model , add form ui value change listener for 2 two-way linkContext.
   * 3. add watch fn.
   *
   * returns directives array found in el
   *  */
function compileDOM(el) {
  var expr, foundDirectives = [];
  if (el.getAttribute) {
    each(directives, function (directive) {
      if (expr = el.getAttribute(directive)) {
        foundDirectives.push(directive);
        getLinkContext(el, directive, expr);
      }
    });
  } else if (el.nodeType === 3) {
    // text node , and it may contains several watches
    foundDirectives.push('x-bind');
    getLinkContextsFromInterpolation(el, el.textContent);
  }

  return foundDirectives;
}

function compile(el) {
  /**
   * 1. case x-repeat origin , compile it but skip childNodes compiling.
   * 2. case x-repeat clone , skip compiling , but go on compiling its childNodes.
   *
   *  */
  var foundDirectives;
  if (!el.$$child) {
    foundDirectives = compileDOM(el);
    if (foundDirectives.indexOf('x-repeat') > -1) {
      console.log('this is x-repeat, stop childNodes compile');
      return;
    }
  }
  else {
    console.log('this is a clone x-repeat, skip compile');
  }

  each(el.childNodes, function (node) {
    compile(node);
  });
}
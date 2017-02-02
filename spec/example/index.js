(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";function getId(e){return Array.isArray(e)?e.map(getId):{_id:e._id}}var src_1=require("../../src"),opgp_service_1=require("opgp-service"),randombins_1=require("randombins"),PouchDB=require("pouchdb-browser"),pbkdf2=require("pbkdf2").pbkdf2,randombytes=require("randombytes"),debug=require("debug");debug.enable("example:*,cbox-vault:*,rx-pouchdb:*,id-encoder:*,shuffled-bins:*");var opgp=opgp_service_1.default(),salt=randombytes(64),hash=function(e){return new Promise(function(r,a){pbkdf2(e,salt,4096,24,function(e,d){e?a(e):r(d)})})},alphabet="-abcdefghijklmnopqrstuvw_",getRandomBins=randombins_1.default({size:16}),bins=getRandomBins([alphabet,alphabet]).reduce(function(e,r){return e.concat(r)},[]),key=opgp.generateKey("john.doe@example.com",{size:2048,unlocked:!0}),db=new PouchDB("sids"),sids=src_1.default(db,opgp,{cipher:key,auth:key},{hash:hash,bins:bins,read:{include_docs:!0}}),docs=[{_id:"hubbard-rob_monty-on-the-run",title:"Monty on the Run",author:"Rob Hubbard",release:"1985"},[{_id:"hubbard-rob_sanxion",title:"Sanxion",author:"Rob Hubbard",release:"1986"},{_id:"tel-jeroen_ikari-union",title:"Ikari Union",author:"Jeroen Tel",release:"1987"}]],refs=docs.map(getId),write$=sids.write(docs),read$=sids.read(refs),search$=sids.read([{startkey:"hubbard-",endkey:"hubbard-￿"}]);write$.forEach(debug("example:write:")).catch(debug("example:write:error:")).then(function(){return read$.forEach(debug("example:read:"))}).catch(debug("example:read:error:")).then(function(){return search$.forEach(debug("example:search:"))}).catch(debug("example:search:error:")).then(function(){return db.destroy()}).then(debug("example:destroy:done")).catch(debug("example:destroy:error:"));
},{"../../src":5,"debug":undefined,"opgp-service":undefined,"pbkdf2":undefined,"pouchdb-browser":undefined,"randombins":undefined,"randombytes":undefined}],2:[function(require,module,exports){
"use strict";function unwrapKeyRing(t){return unwrapOneOrMore(t.auth).then(function(r){return unwrapOneOrMore(t.cipher).then(function(t){return{auth:r,cipher:t}})})}function unwrapOneOrMore(t){return Promise.all([].concat(t))}function setDocBoxContent(t,r){return tslib_1.__assign({},t,{content:r})}var rx_pouchdb_1=require("rx-pouchdb"),rxjs_1=require("rxjs"),tslib_1=require("tslib"),CoreVaultWrapperClass=function(){function t(t){this.vault$=t}return t.prototype.write=function(t){return this.vault$.flatMap(function(r){return r.write(t)})},t.prototype.read=function(t,r){return this.vault$.flatMap(function(n){return n.read(t,r)})},t.prototype.unlock=function(r){var n=this.vault$.flatMap(function(t){return unwrapKeyRing(r).then(function(r){return t.unlock(r)})});return new t(n)},t}();CoreVaultWrapperClass.getInstance=function(t,r,n,e){var o=rx_pouchdb_1.default(t,e),u=rxjs_1.Observable.fromPromise(unwrapKeyRing(n)),i=u.map(function(t){return CoreVaultClass.getInstance(o,r,t)});return new CoreVaultWrapperClass(i)};var CoreVaultClass=function(){function t(t,r,n){this.rxdb=t,this.opgp=r,this.keys=n}return t.prototype.write=function(t){var r=this,n=t.flatMap(function(t){return r.encrypt(t)});return this.rxdb.write(n)},t.prototype.read=function(t,r){var n=this,e=this.rxdb.read(t);return e.flatMap(function(t){return n.decrypt(t)})},t.prototype.unlock=function(r){return t.getInstance(this.rxdb,this.opgp,r)},t.prototype.encrypt=function(t){var r=this;return Array.isArray(t)?Promise.all(t.map(function(t){return r.encryptDoc(t)})):this.encryptDoc(t)},t.prototype.decrypt=function(t){var r=this;return Array.isArray(t)?Promise.all(t.map(function(t){return r.decryptDoc(t)})):this.decryptDoc(t)},t.prototype.encryptDoc=function(t){return Promise.resolve(this.opgp.encrypt(this.keys,t.content).then(function(r){return setDocBoxContent(t,r)}))},t.prototype.decryptDoc=function(t){return Promise.resolve(this.opgp.decrypt(this.keys,t.content).then(function(r){return setDocBoxContent(t,r)}))},t}();CoreVaultClass.getInstance=function(t,r,n,e){return new CoreVaultClass(t,r,n)};var getCoreVault=CoreVaultWrapperClass.getInstance;Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=getCoreVault;
},{"rx-pouchdb":undefined,"rxjs":undefined,"tslib":undefined}],3:[function(require,module,exports){
"use strict";function box(r,n){return Array.isArray(r)?r.map(function(r){return boxDoc(r)}):boxDoc(r)}function unbox(r){return Array.isArray(r)?r.map(function(r){return unboxDocBox(r)}):unboxDocBox(r)}function boxDoc(r,n){var e={_id:n||r._id,content:JSON.stringify(r)};return r._rev&&(e._rev=r._rev),r._deleted&&(e._deleted=r._deleted),e}function unboxDocBox(r){var n=tslib_1.__assign({},r);return delete n.content,tslib_1.__assign(n,JSON.parse(r.content)),n._rev=r._rev,n}var tslib_1=require("tslib");exports.box=box,exports.unbox=unbox;

},{"tslib":undefined}],4:[function(require,module,exports){
"use strict";function encode(e,n){return Array.isArray(n)?Promise.all(n.map(function(n){return e.encode(n)})):e.encode(n)}function getFullPrefixedRange(e){return{startkey:e,endkey:e+MAX_UNICODE}}function setDocId(e,n){return tslib_1.__assign({},e,{_id:n})}function isValidShuffledBinArray(e){return!!e&&!!e.keys&&Array.isArray(e.keys.shuffled)&&!!e.allocator&&e.allocator.length===e.keys.shuffled.length&&["indexOf","map"].every(function(n){return utils_1.isFunction(e.allocator[n])})&&e.keys.shuffled.every(utils_1.isString)}var __extends=this&&this.__extends||function(e,n){function t(){this.constructor=e}for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r]);e.prototype=null===n?Object.create(n):(t.prototype=n.prototype,new t)},utils_1=require("./utils"),base64=require("base64-js"),tslib_1=require("tslib"),ENCODED_HASH="%23",ENCODED_SLASH="%2F",MAX_UNICODE="￿",PassThroughEncoder=function(){function e(){}return e.prototype.encodeRange=function(e){return Promise.resolve([e])},e.prototype.encode=function(e){return Promise.resolve(e)},e}(),IdEncoderWrapperClass=function(){function e(e){this.encoder=e}return e.prototype.encodeRange=function(e){return this.encoder.then(function(n){return n.encodeRange(e)})},e.prototype.encode=function(e){return this.encoder.then(function(n){return encode(n,e)})},e}();IdEncoderWrapperClass.getInstance=function(e,n){if(!utils_1.isFunction(e))return new PassThroughEncoder;var t=Promise.resolve(n&&n.shuffledbins).then(function(n){return isValidShuffledBinArray(n)?SemiHomomorphicIdEncoderClass.getInstance(e,n):IdEncoderClass.getInstance(e)});return new IdEncoderWrapperClass(t)};var IdEncoderClass=function(){function e(e){this.hash=e}return e.getInstance=function(n,t){return new e(n)},e.prototype.encodeRange=function(e){return Promise.resolve([getFullPrefixedRange(this.getPrefix())])},e.prototype.encode=function(e){var n=this;return Promise.resolve(this.hash(e._id)).then(function(t){return setDocId(e,n.getPrefix()+base64.fromByteArray(t))})},e.prototype.getPrefix=function(e){return e?ENCODED_HASH+e:ENCODED_HASH},e}(),SemiHomomorphicIdEncoderClass=function(e){function n(n,t){var r=e.call(this,n)||this;return r.shuffledbins=t,r}return __extends(n,e),n.getInstance=function(e,t){return new n(e,t)},n.prototype.encodeRange=function(e){var n=this,t=e.startkey?this.shuffledbins.allocator.indexOf(e.startkey):0,r=e.endkey?this.shuffledbins.allocator.indexOf(e.endkey)+1:this.shuffledbins.allocator.length,o=this.shuffledbins.keys.shuffled.slice(t,r).map(function(e){return getFullPrefixedRange(n.getPrefix(e))});return Promise.resolve(o)},n.prototype.encode=function(n){var t=this,r=this.shuffledbins.allocator.indexOf(n._id),o=this.shuffledbins.keys.shuffled[r];return e.prototype.encode.call(this,n).then(function(e){return setDocId(e,t.getPrefix(o)+e._id)})},n.prototype.getPrefix=function(n){return e.prototype.getPrefix.call(this,n)+ENCODED_SLASH},n}(IdEncoderClass),getIdCodec=IdEncoderWrapperClass.getInstance;Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=getIdCodec;

},{"./utils":9,"base64-js":undefined,"tslib":undefined}],5:[function(require,module,exports){
"use strict";function concat(e,r){return e&&e.length?e.concat(r):r}function update(e,r){return Array.isArray(r)?zip(e,r,updateDoc):updateDoc(e,r)}function updateDoc(e,r){return tslib_1.__assign({},e,{_rev:r._rev})}function zip(e,r,t){return e.map(function(e,u){return t(e,r[u])})}var core_vault_1=require("./core-vault"),read_request_1=require("./read-request"),id_encoder_1=require("./id-encoder"),shuffled_bins_1=require("./shuffled-bins"),doc_box_1=require("./doc-box"),rxjs_1=require("rxjs"),tslib_1=require("tslib"),debug=require("debug"),CboxVaultClass=function(){function e(e,r,t){this.vault=e,this.encoder=r,this.getReadRequest$=t}return e.prototype.write=function(e){var r=this,t=rxjs_1.Observable.from(e).do(debug("cbox-vault:write:")).share(),u=t.map(function(e){return doc_box_1.box(e)}).concatMap(function(e){return r.encoder.encode(e)});return this.vault.write(u).zip(t).map(function(e){var r=e[0],t=e[1];return update(t,r)}).share()},e.prototype.read=function(e,r){var t=this,u=rxjs_1.Observable.from(e).do(debug("cbox-vault:read:")).share(),n=u.concatMap(function(e){return t.getReadRequest$(e)}).share();return this.vault.read(n.pluck("value")).map(doc_box_1.unbox).zip(n).groupBy(function(e){var r=(e[0],e[1]);return r.key},function(e){var r=e[0],t=e[1];return t.mapResponse(r)}).flatMap(function(e){return e.reduce(concat)}).share()},e.prototype.unlock=function(r){return new e(this.vault.unlock(r),this.encoder,this.getReadRequest$)},e}();CboxVaultClass.getInstance=function(e,r,t,u){var n=core_vault_1.default(e,r,t,{read:u&&u.read}),a=u&&id_encoder_1.default(u.hash,{shuffledbins:Promise.resolve(u&&u.bins).then(function(e){return shuffled_bins_1.default(e)})}),o=read_request_1.default(a);return new CboxVaultClass(n,a,o)};var getCboxVault=CboxVaultClass.getInstance;Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=getCboxVault;
},{"./core-vault":2,"./doc-box":3,"./id-encoder":4,"./read-request":7,"./shuffled-bins":8,"debug":undefined,"rxjs":undefined,"tslib":undefined}],6:[function(require,module,exports){
"use strict";function padStart(t,r,e){var a=+r-t.length;return Number.isSafeInteger(a)&&a>0?addStart(t,a,toPadString(e)):t}function toPadString(t,r){var e=t&&t.toString();return e&&e.length?e:r||" "}function addStart(t,r,e){return r>e.length?addStart(t,r,e+e):e.slice(0,r)+t}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=padStart;

},{}],7:[function(require,module,exports){
"use strict";function compareDocIds(e,n){return e._id>n._id?1:e._id<n._id?-1:0}function isWithinRange(e){if(!e)return RANGE_PREDICATE_FACTORY.unbound();var n=utils_1.isString(e.startkey),t=utils_1.isString(e.endkey);return n?t?RANGE_PREDICATE_FACTORY.bound(e):RANGE_PREDICATE_FACTORY.lobound(e):t?RANGE_PREDICATE_FACTORY.hibound(e):RANGE_PREDICATE_FACTORY.unbound()}function isValidIdEncoder(e){return!!e&&utils_1.isFunction(e.encode)&&utils_1.isFunction(e.encodeRange)}function isDocIdRange(e){return!e._id&&(utils_1.isString(e.startkey)||utils_1.isString(e.endkey))}var __extends=this&&this.__extends||function(e,n){function t(){this.constructor=e}for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r]);e.prototype=null===n?Object.create(n):(t.prototype=n.prototype,new t)},id_encoder_1=require("./id-encoder"),utils_1=require("./utils"),rxjs_1=require("rxjs"),ReadRequestClass=function(){function e(e,n){this.encoder=e,this.key=n}return e.prototype.mapResponse=function(e){return e},e}();ReadRequestClass.getFactory=function(e,n){var t=isValidIdEncoder(e)?e:id_encoder_1.default(),r=new KeyGenerator;return function(e,n){return isDocIdRange(e)?DocIdRangeReadRequestClass.getInstance$(t,r,e):DocRefReadRequestClass.getInstance$(t,r,e)}};var DocIdRangeReadRequestClass=function(e){function n(n,t,r,u){var i=e.call(this,n,t)||this;return i.range=r,i.value=u,i}return __extends(n,e),n.getInstance$=function(e,t,r,u){var i=t.getKey(),o=e.encodeRange(r).then(function(t){return t.map(function(t){return new n(e,i,r,t)})});return rxjs_1.Observable.fromPromise(o).concatMap(function(e){return rxjs_1.Observable.from(e)})},n.prototype.mapResponse=function(e){return e.filter(isWithinRange(this.range)).sort(compareDocIds)},n}(ReadRequestClass),DocRefReadRequestClass=function(e){function n(n,t,r){var u=e.call(this,n,t)||this;return u.value=r,u}return __extends(n,e),n.getInstance$=function(e,t,r,u){var i=t.getKey(),o=e.encode(r).then(function(t){return new n(e,i,t)});return rxjs_1.Observable.fromPromise(o)},n}(ReadRequestClass),KeyGenerator=function(){function e(e){void 0===e&&(e=0),this.seq=e}return e.prototype.getKey=function(){return++this.seq+Math.random().toString().slice(1)},e}(),RANGE_PREDICATE_FACTORY={unbound:function(){return function(e){return!0}},bound:function(e){return function(n){return n._id<=e.endkey&&n._id>=e.startkey}},lobound:function(e){return function(n){return n._id>=e.endkey}},hibound:function(e){return function(n){return n._id<=e.endkey}}},getReadRequestFactory=ReadRequestClass.getFactory;Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=getReadRequestFactory;

},{"./id-encoder":4,"./utils":9,"rxjs":undefined}],8:[function(require,module,exports){
"use strict";function isValidBinList(r){return Array.isArray(r)&&r.every(utils_1.isString)}var pad_start_1=require("./pad-start"),utils_1=require("./utils"),bin_allocator_1=require("bin-allocator"),randomshuffle_1=require("randomshuffle"),ShuffledBinArrayClass=function(){function r(r,t){this.allocator=r,this.keys=t}return r}();ShuffledBinArrayClass.getInstance=function(r,t){if(!isValidBinList(r))throw new TypeError("invalid argument");var e=t&&utils_1.isFunction(t.randomshuffle)?t.randomshuffle:randomshuffle_1.default(),n=bin_allocator_1.default(r),a=(n.length-1).toString(16).length,i=t&&utils_1.isFunction(t.map)?t.map:function(r){return pad_start_1.default(r.toString(16),a,"0")},u=n.map(function(r,t){return i(t)}),l={ordered:u,shuffled:e(u)},s=new ShuffledBinArrayClass(n,l);return s};var getShuffledBinArray=ShuffledBinArrayClass.getInstance;Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=getShuffledBinArray;

},{"./pad-start":6,"./utils":9,"bin-allocator":undefined,"randomshuffle":undefined}],9:[function(require,module,exports){
"use strict";function isString(n){return"string"==typeof(n&&n.valueOf())}function isNumber(n){return"number"==typeof(n&&n.valueOf())}function isBoolean(n){return"boolean"==typeof(n&&n.valueOf())}function isFunction(n){return"function"==typeof n}function isUndefined(n){return"undefined"==typeof n}exports.isString=isString,exports.isNumber=isNumber,exports.isBoolean=isBoolean,exports.isFunction=isFunction,exports.isUndefined=isUndefined;
},{}]},{},[1]);

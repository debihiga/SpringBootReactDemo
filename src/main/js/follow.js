/*
 * From: https://spring.io/guides/tutorials/react-and-spring-data-rest/
 */

/**
 * Parameters:
 * api: client object used to make REST calls.
 * rootPath: root URI to start from.
 * relArray: array of relationships to navigate along. Each one can be a string or an object.
 *
 * Sample usage:
 * follow(client, root, [{rel: 'employees', // (1)
 * params: {size: pageSize}}]) // (2)
 * .then(...)
 * .done(...);
 * 
 * (1) The array of relationships can be as simple as ["employees"], 
 * meaning when the first call is made, 
 * look in _links for the relationship (or rel) named employees. 
 * Find its href and navigate to it. 
 * If there is another relationship in the array, repeat the process.
 * 
 * (2) It also plugs in a query parameter of ?size=<pageSize>.
*/
module.exports = function follow(api, rootPath, relArray) {
	const root = api({
		method: 'GET',
		path: rootPath
	});

	return relArray.reduce(function(root, arrayItem) {
		const rel = typeof arrayItem === 'string' ? arrayItem : arrayItem.rel;
		return traverseNext(root, rel, arrayItem);
	}, root);

	function traverseNext (root, rel, arrayItem) {
		return root.then(function (response) {
			if (hasEmbeddedRel(response.entity, rel)) {
				return response.entity._embedded[rel];
			}

			if(!response.entity._links) {
				return [];
			}

			if (typeof arrayItem === 'string') {
				return api({
					method: 'GET',
					path: response.entity._links[rel].href
				});
			} else {
				return api({
					method: 'GET',
					path: response.entity._links[rel].href,
					params: arrayItem.params
				});
			}
		});
	}

	function hasEmbeddedRel (entity, rel) {
		return entity._embedded && entity._embedded.hasOwnProperty(rel);
	}
};
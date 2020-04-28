/*
 * From: https://spring.io/guides/tutorials/react-and-spring-data-rest/
 */

'use strict';

// tag::vars[]
const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');
const follow = require('./follow'); // function to hop multiple links by "rel"
const root = '/api';
const when = require('when');
// end::vars[]

/*
 * State
 * Data that the component is expected to handle itself.
 * It is also data that can fluctuate and change.
 * To read the state, you use this.state.
 * To update it, you use this.setState().
 * Every time this.setState() is called, React updates the state,
 * calculates a diff between the previous state and the new state,
 * and injects a set of changes to the DOM on the page.
 * This results in fast and efficient updates to your UI.
 *
 * The common convention is to initialize state with all your attributes empty in the constructor.
 * Then you look up data from the server by using componentDidMount and populating your attributes.
 * From there on, updates can be driven by user action or other events.
 *
 * Properties
 * Encompass data that is passed into the component.
 * Properties do NOT change but are instead fixed values.
 * To set them, you assign them to attributes when creating a new component.
 */
// tag::app[]
class App extends React.Component {

	// Initialize all attributes.
	constructor(props) {
		super(props);
		this.state = { employees: [], attributes: [], pageSize: 2, links: {} };
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	// tag::follow-1[]
	componentDidMount() {
		this.loadFromServer(this.state.pageSize);
	}
	// end::follow-1[]

	// tag::follow-2[]
	/**
	 * Promises
	 * then() functions need to return something, whether it is a value or another promise. 
	 * done() functions do NOT return anything, and you do not chain anything after one.
	 */
	loadFromServer(pageSize) {
		/**
		 * (1) Gets the HAL data with
		 * + _embedded with the list of employees
		 * + _links with the links for the pagination
		 * + page with the information about the page (size, number of elements, page number and total pages)
		 * 
		 * Can be reproduced using:
		 * curl http://localhost:8080/api/employees -H "Accept:application/hal+json"
		 */
		follow(client, root, [
			{ rel: 'employees', params: { size: pageSize } }]
		)
			/** 
			 * (2) Gets the JSON Schema metadata found at /api/profile/employees/ with
			 * + title
			 * + properties (of the fields of each Employee object) --> stored in "attributes" state in (5)
			 * + definitions
			 * + type
			 * + schema
			 * 
			 * Can be reproduced using:
			 * curl http://localhost:8080/api/profile/employees -H "Accept:application/schema+json"
			 */
			.then(employeeCollection => {
				return client({
					method: 'GET',
					path: employeeCollection.entity._links.profile.href,
					headers: { 'Accept': 'application/schema+json' }
				}).then(schema => {
					this.schema = schema.entity;
					this.links = employeeCollection.entity._links;
					return employeeCollection;
				});
			})
			/**
			 * (3) Gets each individual resource.
			 * This is what you need to fetch an ETag header for each employee.
			 * https://www.baeldung.com/etags-for-rest-with-spring
			 * 
			 * Can be reproduced using:
			 * curl "http://localhost:8080/api/employees/1" -H "Accept:application/hal+json"
			 */
			.then(employeeCollection => {
				return employeeCollection.entity._embedded.employees.map(employee =>
					client({
						method: 'GET',
						path: employee._links.self.href
					})
				);
			})
			/**
			 * (4) Gets all promises and
			 * merges them into a single promise
			 */
			.then(employeePromises => {
				return when.all(employeePromises);
			})
			/**
			 * (5) Sets:
			 * + employees: list
			 * + attributes: list of attributes type of the "Employee" object
			 * + page size and links for the pagination
			 */
			.done(employees => {
				this.setState({
					employees: employees,
					attributes: Object.keys(this.schema.properties),
					pageSize: pageSize,
					links: this.links
				});
			});
	}
	// end::follow-2[]

	// tag::create[]
	onCreate(newEmployee) {
		follow(client, root, ['employees']).then(employeeCollection => {
			return client({
				method: 'POST',
				path: employeeCollection.entity._links.self.href,
				entity: newEmployee,
				headers: { 'Content-Type': 'application/json' }
			})
		}).then(response => {
			return follow(client, root, [
				{ rel: 'employees', params: { 'size': this.state.pageSize } }]);
		})
			/**
			 * New records are typically added to the end of the dataset. 
			 * Since you are looking at a certain page, 
			 * it is logical to expect the new employee record to not be on the current page. 
			 * To handle this, you need to fetch a new batch of data with the same page size applied. 
			 * Since the user probably wants to see the newly created employee, 
			 * you can then use the hypermedia controls and navigate to the last entry.
			 */
			.done(response => {
				if (typeof response.entity._links.last !== "undefined") {
					this.onNavigate(response.entity._links.last.href);
				} else {
					this.onNavigate(response.entity._links.self.href);
				}
			});
	}
	// end::create[]

	// tag::update[]
	/**
	 * A PUT with an If-Match request header causes Spring Data REST to 
	 * check the value against the current version. 
	 * If the incoming If-Match value does not match the data store’s version value, 
	 * Spring Data REST will fail with an HTTP 412 Precondition Failed.
	 */
	onUpdate(employee, updatedEmployee) {
		client({
			method: 'PUT',
			path: employee.entity._links.self.href,
			entity: updatedEmployee,
			headers: {
				'Content-Type': 'application/json',
				'If-Match': employee.headers.Etag
			}
		}).done(response => {
			this.loadFromServer(this.state.pageSize);
		}, response => {
			if (response.status.code === 412) {
				alert('DENIED: Unable to update ' +
					employee.entity._links.self.href + '. Your copy is stale.');
			}
		});
	}
	// end::update[]

	// tag::delete[]
	onDelete(employee) {
		client({ method: 'DELETE', path: employee._links.self.href }).done(response => {
			this.loadFromServer(this.state.pageSize);
		});
	}
	// end::delete[]

	// tag::navigate[]
	/**
	 * Adjusting the controls dynamically, based on available navigation links.
	 */
	onNavigate(navUri) {
		client({
			method: 'GET',
			path: navUri
		}).then(employeeCollection => {
			this.links = employeeCollection.entity._links;
			return employeeCollection.entity._embedded.employees.map(employee =>
				client({
					method: 'GET',
					path: employee._links.self.href
				})
			);
		}).then(employeePromises => {
			return when.all(employeePromises);
		}).done(employees => {
			this.setState({
				employees: employees,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}
	// end::navigate[]

	// tag::update-page-size[]
	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}
	// end::update-page-size[]

	render() {
		return (
			<div>
				<CreateDialog attributes={this.state.attributes} onCreate={this.onCreate} />
				<EmployeeList employees={this.state.employees}
					links={this.state.links}
					pageSize={this.state.pageSize}
					attributes={this.state.attributes}
					onNavigate={this.onNavigate}
					onUpdate={this.onUpdate}
					onDelete={this.onDelete}
					updatePageSize={this.updatePageSize} />
			</div>
		)
	}
}
// end::app[]

// tag::update-dialog[]
class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const updatedEmployee = {};
		this.props.attributes.forEach(attribute => {
			updatedEmployee[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onUpdate(this.props.employee, updatedEmployee);
		window.location = "#";
	}

	render() {
		const inputs = this.props.attributes.map(attribute =>
			<p key={this.props.employee.entity[attribute]}>
				<input type="text" placeholder={attribute}
					defaultValue={this.props.employee.entity[attribute]}
					ref={attribute} className="field" />
			</p>
		);

		/** 
		 * There is only one CreateDialog link on the entire UI, 
		 * but a separate UpdateDialog link for every row displayed. 
		 * Hence, the id field is based on the self link’s URI.
		*/
		const dialogId = "updateEmployee-" + this.props.employee.entity._links.self.href;

		return (
			<div key={this.props.employee.entity._links.self.href}>
				<a href={"#" + dialogId}>Update</a>
				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update an employee</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Update</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

};
// end::update-dialog[]

// tag::employee-list[]
class EmployeeList extends React.Component {

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	// tag::handle-page-size-updates[]
	handleInput(e) {
		e.preventDefault();
		const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize);
		} else {
			ReactDOM.findDOMNode(this.refs.pageSize).value =
				pageSize.substring(0, pageSize.length - 1);
		}
	}
	// end::handle-page-size-updates[]

	// tag::handle-nav[]
	handleNavFirst(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}

	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}

	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}

	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}
	// end::handle-nav[]

	// tag::employee-list-render[]
	render() {
		/*
		*	Whenever you work with Spring Data REST, the self link is the key for a given resource.
		*	React needs a unique identifier for child nodes, and _links.self.href is perfect.
		*/
		const employees = this.props.employees.map(employee =>
			<Employee key={employee.entity._links.self.href}
				employee={employee}
				attributes={this.props.attributes}
				onUpdate={this.props.onUpdate}
				onDelete={this.props.onDelete} />
		);

		const navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
		}
		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
		}
		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
		}
		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
		}

		return (
			<div>
				<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput} />
				<table>
					<tbody>
						<tr>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Description</th>
							<th></th>
							<th></th>
						</tr>
						{employees}
					</tbody>
				</table>
				<div>
					{navLinks}
				</div>
			</div>
		)
	}
	// end::employee-list-render[]
}
// end::employee-list[]

/*
Splitting your app up into small components that each do one job
will make it easier to build up functionality in the future.
*/
// tag::employee[]
class Employee extends React.Component {

	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.employee);
	}

	render() {
		return (
			<tr>
				<td>{this.props.employee.entity.firstName}</td>
				<td>{this.props.employee.entity.lastName}</td>
				<td>{this.props.employee.entity.description}</td>
				<td>
					<UpdateDialog employee={this.props.employee}
						attributes={this.props.attributes}
						onUpdate={this.props.onUpdate} />
				</td>
				<td>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}
// end::employee[]

// tag::create-dialog[]
class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const newEmployee = {};
		// Gets the input for each attribute.
		/**
		 * this.refs is a way to reach out and grab a particular React component by name. 
		 * Note that you are getting ONLY the virtual DOM component.
		 * React.findDOMNode() grabs the actual DOM element.
		 * https://www.codecademy.com/articles/react-virtual-dom
		 */
		this.props.attributes.forEach(attribute => {
			newEmployee[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newEmployee);

		// clear out the dialog's inputs
		this.props.attributes.forEach(attribute => {
			ReactDOM.findDOMNode(this.refs[attribute]).value = '';
		});

		// Navigate away from the dialog to hide it.
		window.location = "#";
	}

	render() {
		// Creates an input element for each attribute.
		const inputs = this.props.attributes.map(attribute =>
			<p key={attribute}>
				<input type="text" placeholder={attribute} ref={attribute} className="field" />
			</p>
		);

		return (
			<div>
				<a href="#createEmployee">Create</a>

				<div id="createEmployee" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new employee</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

}
// end::create-dialog[]

// Renders in <div id="react"></div> from index.html
// tag::render[]
ReactDOM.render(
	<App />,
	document.getElementById('react')
)
// end::render[]
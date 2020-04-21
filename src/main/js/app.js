'use strict';

// tag::vars[]
const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');
// end::vars[]

/*
 * From: https://spring.io/guides/tutorials/react-and-spring-data-rest/
 *
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
		this.state = {employees: []};
	}

    // Populate attributes
	componentDidMount() {
		client({method: 'GET', path: '/api/employees'}).done(response => {
			this.setState({employees: response.entity._embedded.employees});
		});
	}

	render() {
		return (
			<EmployeeList employees={this.state.employees}/>
		)
	}
}
// end::app[]

// tag::employee-list[]
class EmployeeList extends React.Component {
	render() {
	    /*
	    *	Whenever you work with Spring Data REST, the self link is the key for a given resource.
	    *	React needs a unique identifier for child nodes, and _links.self.href is perfect.
	    */
		const employees = this.props.employees.map(employee =>
			<Employee key={employee._links.self.href} employee={employee}/>
		);
		return (
			<table>
				<tbody>
					<tr>
						<th>First Name</th>
						<th>Last Name</th>
						<th>Description</th>
					</tr>
					{employees}
				</tbody>
			</table>
		)
	}
}
// end::employee-list[]

/*
Splitting your app up into small components that each do one job
will make it easier to build up functionality in the future.
*/
// tag::employee[]
class Employee extends React.Component{
	render() {
		return (
			<tr>
				<td>{this.props.employee.firstName}</td>
				<td>{this.props.employee.lastName}</td>
				<td>{this.props.employee.description}</td>
			</tr>
		)
	}
}
// end::employee[]

// Renders in <div id="react"></div> from index.html
// tag::render[]
ReactDOM.render(
	<App />,
	document.getElementById('react')
)
// end::render[]
function LoggedInName()
{
	var _ud = localStorage.getItem('user_data');
	var ud = _ud ? JSON.parse(_ud) : null; // JSON.parse() can return null, which needs to be accounted for
	//var userId = ud.id;
	
	// Default values in case user data is not available
    var firstName = ud ? ud.firstName : '';
    var lastName = ud ? ud.lastName : '';

	const doLogout = (event: { preventDefault: () => void; }) =>
	{
		event.preventDefault();
		
		localStorage.removeItem("user_data");
		window.location.href = '/';
	};


	return(
		<div id="loggedInDiv">
			<span id="userName">Logged In As {firstName} {lastName}</span><br />
			<button type="button" id="logoutButton" className="buttons" onClick={doLogout}> Log Out </button>
		</div>
	);
};

export default LoggedInName;

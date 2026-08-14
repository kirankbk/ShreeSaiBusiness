
	
	
	
	
	const API_BASE_URL =
    "http://localhost:5000/api";


async function apiRequest(

    endpoint,
    options = {}
) {
debugger
    const token =
        localStorage.getItem("token");


    const headers = {
        "Content-Type":
            "application/json",

        ...(options.headers || {})
    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );


    let data = null;

    try {
        data =
            await response.json();
    }
    catch {
        data = null;
    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            "Server error"
        );

    }


    return data;
}
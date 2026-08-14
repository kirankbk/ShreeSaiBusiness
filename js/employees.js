let employees = [];


/* =====================================
   LOAD EMPLOYEES
===================================== */

async function loadEmployees() {
debugger
    const table =
        document.getElementById(
            "employeeTable"
        );


    table.innerHTML = `
        <tr>
            <td colspan="7"
                style="text-align:center">

                Loading...

            </td>
        </tr>
    `;


    try {
    debugger
        const result =
            await apiRequest(
                "/employees"
            );


        employees =
            Array.isArray(result)
                ? result
                : result.data || [];


        renderEmployees();

    }
    catch (error) {

        table.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center">

                    ${escapeHtml(
                        error.message
                    )}

                </td>
            </tr>
        `;

    }

}


/* =====================================
   RENDER
===================================== */

function renderEmployees() {
debugger
    const table =
        document.getElementById(
            "employeeTable"
        );


    if (!employees.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center">

                    कर्मचारी उपलब्ध नाहीत.

                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = "";


    employees.forEach(
        employee => {

            const row =
                document.createElement(
                    "tr"
                );


            const active =
                employee.IsActive !== false;


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        employee.EmployeeCode || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        employee.EmployeeName || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        employee.Email || "-"
                    )}
                </td>
                 <td>
                    ${escapeHtml(
                        employee.businessType || "-"
                    )}
                </td>
                <td>
                    ${escapeHtml(
                        employee.Designation || "-"
                    )}
                </td>

                <td>
                    ₹${Number(
                        employee.MonthlySalary || 0
                    ).toLocaleString("en-IN")}
                </td>

                <td>

                    <span class="
                        status
                        ${
                            active
                            ? "status-active"
                            : "status-inactive"
                        }
                    ">

                        ${
                            active
                            ? "Active"
                            : "Inactive"
                        }

                    </span>

                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="btn btn-primary"
                            onclick="
                                editEmployee(
                                    ${employee.EmployeeId}
                                )
                            ">

                            Edit

                        </button>


                        <button
                            class="btn btn-danger"
                            onclick="
                                deactivateEmployee(
                                    ${employee.EmployeeId}
                                )
                            ">

                            Deactivate

                        </button>

                    </div>

                </td>

            `;


            table.appendChild(row);

        }
    );

}


/* =====================================
   OPEN MODAL
===================================== */

function openEmployeeModal() {

    document
        .getElementById(
            "employeeForm"
        )
        .reset();


    document
        .getElementById(
            "employeeId"
        )
        .value = "";


    document
        .getElementById(
            "employeeModal"
        )
        .classList.add("show");

}


/* =====================================
   CLOSE MODAL
===================================== */

function closeEmployeeModal() {

    document
        .getElementById(
            "employeeModal"
        )
        .classList.remove("show");

}


/* =====================================
   EDIT
===================================== */

function editEmployee(id) {
debugger
    const employee =
        employees.find(
            x =>
                Number(x.EmployeeId) ===
                Number(id)
        );


    if (!employee)
        return;


    document
        .getElementById("employeeId")
        .value =
        employee.EmployeeId;


    document
        .getElementById("employeeName")
        .value =
        employee.EmployeeName || "";


    document
        .getElementById("employeeCode")
        .value =
        employee.EmployeeCode || "";


    document
        .getElementById("mobile")
        .value =
        employee.Email || "";


    document
        .getElementById("designation")
        .value =
        employee.Designation || "";


    document
        .getElementById("businessType")
        .value =
        employee.businessType || "";


    document
        .getElementById("monthlySalary")
        .value =
        employee.MonthlySalary || 0;


    document
        .getElementById(
            "employeeModal"
        )
        .classList.add("show");

}


/* =====================================
   SAVE
===================================== */

document
    .getElementById(
        "employeeForm"
    )
    .addEventListener(
        "submit",
        async function(event) {
debugger
            event.preventDefault();


            const id =
                document
                    .getElementById(
                        "employeeId"
                    )
                    .value;


            const employee = {

                employeeName:
                    document
                        .getElementById(
                            "employeeName"
                        )
                        .value
                        .trim(),

                employeeCode:
                    document
                        .getElementById(
                            "employeeCode"
                        )
                        .value
                        .trim(),

                email:
                    document
                        .getElementById(
                            "mobile"
                        )
                        .value
                        .trim(),

                designation:
                    document
                        .getElementById(
                            "designation"
                        )
                        .value
                        .trim(),

                businessType:
                    document
                        .getElementById(
                            "businessType"
                        )
                        .value,
						
                joiningDate:document.getElementById("joiningDate").value, 
                    
                monthlySalary:
                    Number(
                        document
                            .getElementById(
                                "monthlySalary"
                            )
                            .value
                    )

            };


            try {

                if (id) {

                    await apiRequest(
                        `/employees/${id}`,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify(
                                    employee
                                )
                        }
                    );

                    alert(
                        "कर्मचारी माहिती अपडेट झाली."
                    );

                }
                else {

                    await apiRequest(
                        "/employees",
                        {
                            method: "POST",

                            body:
                                JSON.stringify(
                                    employee
                                )
                        }
                    );

                    alert(
                        "नवीन कर्मचारी जोडला."
                    );

                }


                closeEmployeeModal();

                await loadEmployees();

            }
            catch (error) {

                alert(
                    error.message
                );

            }

        }
    );


/* =====================================
   DEACTIVATE
===================================== */

async function deactivateEmployee(id) {
	debugger

    const employee =
        employees.find(
            x =>
                Number(x.EmployeeId) ===
                Number(id)
        );


    if (!employee)
        return;


    const confirmAction =
        confirm(
            `${employee.EmployeeName} `
            +
            `या कर्मचाऱ्याला Deactivate करायचे आहे का?`
        );


    if (!confirmAction)
        return;


    try {

        /*
          Production मध्ये actual DELETE
          करण्याऐवजी deactivate API वापरतो.
        */

        await apiRequest(
            `/employees/${id}/deactivate`,
            {
                method: "PATCH"
            }
        );


        await loadEmployees();


        alert(
            "कर्मचारी Deactivate झाला."
        );

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


/* =====================================
   HTML ESCAPE
===================================== */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================
   START
===================================== */

loadEmployees();


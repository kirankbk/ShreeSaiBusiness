let employees = [];


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const user =
            getLoggedUser();


        if (!user) {

            return;

        }


        // if (
            // String(user.role)
                // .toLowerCase() !==
            // "admin"
        // ) {

            // window.location.href =
                // "employee-dashboard.html";

            // return;

        // }


        document
            .getElementById(
                "adminName"
            )
            .innerText =
            user.name ||
            user.username ||
            "Admin";


        setTodayDate();
 setCurrentMonth();
     await loadAdvanceData();
        await loadDashboard();

    }
);
function setCurrentMonth() {

    const now = new Date();

    const month =
        now.getMonth() + 1;


    const year =
        now.getFullYear();


    const monthSelect =
        document.getElementById(
            "advanceMonth"
        );


    if (monthSelect) {

        monthSelect.value =
            month;

    }


    const salaryYear =
        document.getElementById(
            "salaryYear"
        );


    if (salaryYear) {

        salaryYear.value =
            year;

    }

}
async function loadAdvanceData() {

    try {

        await loadEmployeesForAdvance();

        await loadAdvanceSummary();

        await loadAdvanceHistory();

    }
    catch (error) {

        console.error(
            "Advance loading error:",
            error
        );

    }

}
async function loadEmployeesForAdvance() {

    const select =
        document.getElementById(
            "advanceEmployee"
        );


    if (!select)
        return;


    try {

        const result =
            await apiRequest(
                "/employees"
            );


        const employeeList =
            Array.isArray(result)
                ? result
                : result.data || [];


        select.innerHTML = `

            <option value="">
                कर्मचारी निवडा
            </option>

        `;


        employeeList.forEach(
            employee => {

                if (
                    employee.Status &&
                    String(
                        employee.IsActive
                    ).toLowerCase()
                    !== "true"
                ) {

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    employee.EmployeeId;


                option.textContent =
                    `${employee.EmployeeName || employee.name}
                     - ${employee.BusinessType || ""}`;


                select.appendChild(
                    option
                );

            }
        );

    }
    catch (error) {

        console.error(
            error
        );

    }

}

async function giveAdvance() {

    const employeeId =
        document
            .getElementById(
                "advanceEmployee"
            )
            .value;


    const advanceDate =
        document
            .getElementById(
                "advanceDate"
            )
            .value;


    const amount =
        Number(
            document
                .getElementById(
                    "advanceAmount"
                )
                .value
        );


    const remark =
        document
            .getElementById(
                "advanceRemark"
            )
            .value
            .trim();


    if (!employeeId) {

        alert(
            "कृपया कर्मचारी निवडा."
        );

        return;

    }


    if (!advanceDate) {

        alert(
            "Advance date निवडा."
        );

        return;

    }


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "योग्य Advance amount टाका."
        );

        return;

    }


    const confirmed =
        confirm(
            `₹${amount.toLocaleString("en-IN")}
             Advance द्यायचा आहे का?`
        );


    if (!confirmed)
        return;


    try {

        await apiRequest(
            "/admin/advances",
            {

                method: "POST",

                body:
                    JSON.stringify({

                        employeeId:
                            Number(employeeId),

                        advanceDate,

                        amount,

                        remark,
						userId:1

                    })

            }
        );


        alert(
            "Advance successfully saved."
        );


        // Clear form

        document
            .getElementById(
                "advanceAmount"
            )
            .value = "";


        document
            .getElementById(
                "advanceRemark"
            )
            .value = "";


        await loadAdvanceData();

        // Salary refresh

        if (
            typeof loadSalaryList
            === "function"
        ) {

            await loadSalaryList();

        }

    }
    catch (error) {

        console.error(
            error
        );


        alert(
            error.message
        );

    }

}

async function loadAdvanceSummary() {

    const month =
        document
            .getElementById(
                "advanceMonth"
            )
            .value;


    const year =
        new Date()
            .getFullYear();


    try {

        const result =
            await apiRequest(
                `/admin/advances?month=${month}&year=${year}`
            );


        const summary =
            Array.isArray(result)
                ? result
                : result.data || [];


        renderAdvanceSummary(
            summary
        );


        calculateAdvanceTotals(
            summary
        );

    }
    catch (error) {

        console.error(
            "Advance summary error:",
            error
        );

    }

}

function renderAdvanceSummary(
    summary
) {

    const table =
        document.getElementById(
            "advanceSummaryTable"
        );


    if (!summary.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center">

                    Advance record उपलब्ध नाही.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    summary.forEach(
        item => {

            const row =
                document.createElement(
                    "tr"
                );


            const monthlySalary =
                Number(
                    item.MonthlySalary || 0
                );


            const totalAdvance =
                Number(
                    item.Amount || 0
                );


            const remaining =
                monthlySalary -
                item.RemainingAmount;


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        item.EmployeeName ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        item.BusinessType ||
                        "-"
                    )}

                </td>


                <td>

                    ${money(
                        monthlySalary
                    )}

                </td>


                <td>

                    <strong>

                        ${money(
                            totalAdvance
                        )}

                    </strong>

                </td>


                <td>

                    <strong>

                        ${money(
                            remaining
                        )}

                    </strong>

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );

}

function calculateAdvanceTotals(
    summary
) {

    let totalAdvance = 0;

    let employeeCount = 0;


    summary.forEach(
        item => {

            const amount =
                Number(
                    item.Amount || 0
                );


            totalAdvance += amount;


            if (amount > 0) {

                employeeCount++;

            }

        }
    );


    document
        .getElementById(
            "totalMonthlyAdvance"
        )
        .innerText =
        money(totalAdvance);


    document
        .getElementById(
            "employeesWithAdvance"
        )
        .innerText =
        employeeCount;

}

async function loadAdvanceHistory() {

    const month =
        document
            .getElementById(
                "advanceMonth"
            )
            .value;


    const year =
        new Date()
            .getFullYear();


    try {

        const result =
            await apiRequest(
                `/admin/advances/summary?month=${month}&year=${year}`
            );


        const advances =
            Array.isArray(result)
                ? result
                : result.data || [];


        renderAdvanceHistory(
            advances
        );

    }
    catch (error) {

        console.error(
            "Advance history error:",
            error
        );

    }

}

function renderAdvanceHistory(
    advances
) {

    const table =
        document.getElementById(
            "advanceHistoryTable"
        );


    if (!advances.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center">

                    Advance history उपलब्ध नाही.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    advances.forEach(
        advance => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                advance.status ||
                "Active";


            let statusClass =
                "status-approved";


            if (
                status === "Cancelled"
            ) {

                statusClass =
                    "status-inactive";

            }


            let action = "-";


            if (
                status === "Active"
            ) {

                action = `

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="
                        cancelAdvance(
                            ${advance.AdvanceId}
                        )">

                        ✕ Cancel

                    </button>

                `;

            }


            row.innerHTML = `

                <td>

                    ${formatDate(
                        advance.AdvanceDate
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        advance.EmployeeName ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        advance.BusinessType ||
                        "-"
                    )}

                </td>


                <td>

                    <strong>

                        ${money(
                            advance.Amount
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHtml(
                        advance.Remark ||
                        "-"
                    )}

                </td>


                <td>

                    <span
                        class="status ${statusClass}">

                        ${escapeHtml(
                            status
                        )}

                    </span>

                </td>


                <td>

                    ${action}

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );

}

async function cancelAdvance(
    advanceId
) {

    const reason =
        prompt(
            "Advance Cancel करण्याचे कारण:"
        );


    if (
        reason === null
    ) {

        return;

    }


    try {

        await apiRequest(
            `/admin/advances/${advanceId}/cancel`,
            {

                method: "PUT",

                body:
                    JSON.stringify({

                        reason:
                            reason.trim(),
							userId:1

                    })

            }
        );


        alert(
            "Advance cancelled successfully."
        );


        await loadAdvanceData();


        if (
            typeof loadSalaryList
            === "function"
        ) {

            await loadSalaryList();

        }

    }
    catch (error) {

        console.error(
            error
        );


        alert(
            error.message
        );

    }

}
// ========================================
// SET TODAY DATE
// ========================================

function setTodayDate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    document
        .getElementById(
            "attendanceDate"
        )
        .value =
        `${year}-${month}-${day}`;

}


// ========================================
// DASHBOARD
// ========================================

async function loadDashboard() {

    try {

        await loadEmployees();

        await loadAttendance();

        await loadLeaveApplications();

    }
    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// ========================================
// EMPLOYEES
// ========================================

async function loadEmployees() {

    try {

        const result =
            await apiRequest(
                "/employees"
            );


        employees =
            Array.isArray(result)
                ? result
                : result.data || [];


        document
            .getElementById(
                "totalEmployees"
            )
            .innerText =
            employees.length;


        renderEmployees();


        populateEmployeeFilter();

    }
    catch (error) {

        console.error(
            "Employees error:",
            error
        );

    }

}


// ========================================
// RENDER EMPLOYEES
// ========================================

function renderEmployees() {

    const table =
        document.getElementById(
            "employeeTable"
        );


    if (!employees.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center">

                    कोणतेही कर्मचारी सापडले नाहीत.

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


            const status =
                employee.status ||
                "Active";


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        employee.EmployeeName ||
                        employee.name ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        employee.EmployeeCode ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        employee.Mobile ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        employee.BusinessType ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        employee.Designation ||
                        "-"
                    )}

                </td>


                <td>

                    ${money(
                        employee.MonthlySalary
                    )}

                </td>


                <td>

                    <span class="
                        status
                        ${
                            status
                                .toLowerCase()
                                === "active"
                                ? "status-approved"
                                : "status-inactive"
                        }
                    ">

                        ${escapeHtml(
                            status
                        )}

                    </span>

                </td>

            `;


            table.appendChild(row);

        }
    );

}


// ========================================
// EMPLOYEE FILTER
// ========================================

function populateEmployeeFilter() {

    const select =
        document.getElementById(
            "leaveEmployeeFilter"
        );


    select.innerHTML = `

        <option value="">
            सर्व कर्मचारी
        </option>

    `;


    employees.forEach(
        employee => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                employee.employeeId;


            option.textContent =
                employee.EmployeeName ||
                employee.name;


            select.appendChild(
                option
            );

        }
    );

}


// ========================================
// ATTENDANCE
// ========================================

async function loadAttendance() {

    try {

        const date =
            document
                .getElementById(
                    "attendanceDate"
                )
                .value;


        const business =
            document
                .getElementById(
                    "attendanceBusiness"
                )
                .value;


        let endpoint =
            `/attendance/daily/2026-08-10`;


        if (business) {

            endpoint +=
                `&businessType=${encodeURIComponent(
                    business
                )}`;

        }


        const result =
            await apiRequest(
                endpoint
            );


        const attendance =
            Array.isArray(result)
                ? result
                : result.data || [];


        renderAttendance(
            attendance
        );


        updateAttendanceSummary(
            attendance
        );

    }
    catch (error) {

        console.error(
            "Attendance error:",
            error
        );

        alert(
            error.message
        );

    }

}


// ========================================
// RENDER ATTENDANCE
// ========================================

function renderAttendance(
    attendance
) {

    const table =
        document.getElementById(
            "attendanceTable"
        );


    if (!attendance.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center">

                    Attendance record उपलब्ध नाही.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    attendance.forEach(
        item => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                item.status ||
                "Absent";


            let statusClass =
                "status-inactive";


            if (
                status.toLowerCase()
                === "present"
            ) {

                statusClass =
                    "status-approved";

            }
            else if (
                status.toLowerCase()
                === "holiday"
            ) {

                statusClass =
                    "status-pending";

            }


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        item.EmployeeName ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        item.EmployeeCode ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        item.BusinessType ||
                        "-"
                    )}

                </td>


                <td>

                    ${formatDateTime(
                        item.CheckInTime
                    )}

                </td>


                <td>

                    ${formatDateTime(
                        item.CheckOutTime
                    )}

                </td>


                <td>

                    <span class="
                        Status
                        ${statusClass}
                    ">

                        ${escapeHtml(
                            status
                        )}

                    </span>

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );

}


// ========================================
// ATTENDANCE SUMMARY
// ========================================

function updateAttendanceSummary(
    attendance
) {

    let present = 0;

    let absent = 0;


    attendance.forEach(
        item => {

            const status =
                String(
                    item.Status || ""
                ).toLowerCase();


            if (
                status === "present"
            ) {

                present++;

            }
            else if (
                status === "absent"
            ) {

                absent++;

            }

        }
    );


    document
        .getElementById(
            "todayPresent"
        )
        .innerText =
        present;


    document
        .getElementById(
            "todayAbsent"
        )
        .innerText =
        absent;

}


// ========================================
// LEAVE APPLICATIONS
// ========================================

async function loadLeaveApplications() {

    try {
debugger
        const status =
            document
                .getElementById(
                    "leaveStatusFilter"
                )
                .value;


        const employeeId =
            document
                .getElementById(
                    "leaveEmployeeFilter"
                )
                .value;


        let endpoint =
            "/admin/leaves";


        const params = [];


        if (status) {

            params.push(
                `status=${encodeURIComponent(
                    status
                )}`
            );

        }


        if (employeeId) {

            params.push(
                `employeeId=${encodeURIComponent(
                    employeeId
                )}`
            );

        }


        if (params.length) {

            endpoint +=
                "?" +
                params.join("&");

        }


        const result =
            await apiRequest(
                "/admin/leaves/Pending"
            );


        const leaves =
            Array.isArray(result)
                ? result
                : result.data || [];


        renderLeaveApplications(
            leaves
        );


        const pendingCount =
            leaves.filter(
                leave =>
                    String(
                        leave.Status
                    ).toLowerCase()
                    === "pending"
            ).length;


        document
            .getElementById(
                "pendingLeaves"
            )
            .innerText =
            pendingCount;

    }
    catch (error) {

        console.error(
            "Leave error:",
            error
        );

        alert(
            error.message
        );

    }

}


// ========================================
// RENDER LEAVES
// ========================================

function renderLeaveApplications(
    leaves
) {

    const table =
        document.getElementById(
            "leaveApplicationsTable"
        );


    if (!leaves.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center">

                    Leave application उपलब्ध नाही.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    leaves.forEach(
        leave => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                leave.Status ||
                "Pending";


            let statusClass =
                "status-pending";


            if (
                status.toLowerCase()
                === "approved"
            ) {

                statusClass =
                    "status-approved";

            }


            if (
                status.toLowerCase()
                === "rejected"
            ) {

                statusClass =
                    "status-inactive";

            }


            let actionHtml =
                "-";


            if (
                status.toLowerCase()
                === "pending"
            ) {

                actionHtml = `

                    <div
                        style="
                        display:flex;
                        gap:5px;
                        flex-wrap:wrap;
                        ">

                        <button
                            class="btn btn-success btn-sm"
                            onclick="
                            approveLeave(
                                ${leave.LeaveTypeId}
                            )">

                            ✓ Approve

                        </button>


                        <button
                            class="btn btn-danger btn-sm"
                            onclick="
                            rejectLeave(
                                ${leave.LeaveTypeId}
                            )">

                            ✕ Reject

                        </button>

                    </div>

                `;

            }


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        leave.EmployeeName ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        leave.LeaveTypeName ||
                        "-"
                    )}

                </td>


                <td>

                    ${formatDate(
                        leave.FromDate
                    )}

                </td>


                <td>

                    ${formatDate(
                        leave.ToDate
                    )}

                </td>


                <td>

                    ${leave.TotalDays || 0}

                </td>


                <td>

                    ${escapeHtml(
                        leave.Reason ||
                        "-"
                    )}

                </td>


                <td>

                    <span class="
                        status
                        ${statusClass}
                    ">

                        ${escapeHtml(
                            status
                        )}

                    </span>

                </td>


                <td>

                    ${actionHtml}

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );

}


// ========================================
// APPROVE LEAVE
// ========================================

async function approveLeave(
    leaveId
) {

    const confirmed =
        confirm(
            "ही Leave approve करायची आहे का?"
        );


    if (!confirmed)
        return;
debugger

    try {

        await apiRequest(
            `/admin/leaves/${leaveId}/approve`,
            {
                method: "PUT",
				body:
                    JSON.stringify({
                        userId:1
                            
                    })
            }
        );


        alert(
            "Leave successfully approved."
        );


        await loadLeaveApplications();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


// ========================================
// REJECT LEAVE
// ========================================

async function rejectLeave(
    leaveId
) {
debugger
    const reason =
        prompt(
            "Leave reject करण्याचे कारण:"
        );


    if (
        reason === null
    )
        return;


    try {

        await apiRequest(
            `/admin/leaves/${leaveId}/reject`,
            {
                method: "PUT",

                body:
                    JSON.stringify({
                        reason:
                            reason.trim(),
							userId:1
                    })
            }
        );


        alert(
            "Leave rejected."
        );


        await loadLeaveApplications();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


// ========================================
// HELPERS
// ========================================

function money(value) {

    return `₹${Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

}


function formatDate(value) {

    if (!value)
        return "-";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    )
        return value;


    return date.toLocaleString(
        "en-IN"
    );

}


function formatDateTime(value) {

    if (!value)
        return "-";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    )
        return value;


    return date.toLocaleString(
        "en-IN"
    );

}


function escapeHtml(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}

// ========================================
// SALARY MANAGEMENT
// ========================================

async function loadSalaryList() {

    try {
debugger
        const month =
            document
                .getElementById("salaryMonth")
                .value;


        const year =
            document
                .getElementById("salaryYear")
                .value;


        const business =
            document
                .getElementById("salaryBusiness")
                .value;


        let endpoint =
            `/admin/salary?month=${month}&year=${year}`;


        if (business) {

            endpoint +=
                `&businessType=${encodeURIComponent(
                    business
                )}`;

        }


        const result =
            await apiRequest(endpoint);


        const salaries =
            Array.isArray(result)
                ? result
                : result.data || [];


        renderSalaryList(salaries);

    }
    catch (error) {

        console.error(
            "Salary loading error:",
            error
        );


        alert(error.message);

    }

}

function renderSalaryList(salaries) {

    const table =
        document.getElementById(
            "salaryTable"
        );


    if (!salaries.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="text-align:center">

                    Salary record उपलब्ध नाही.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    salaries.forEach(
        salary => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                salary.status ||
                "Generated";


            let statusClass =
                "status-pending";


            if (
                status === "Approved"
            ) {

                statusClass =
                    "status-approved";

            }


            if (
                status === "Paid"
            ) {

                statusClass =
                    "status-approved";

            }


            let action = "";


            if (
                status === "Generated"
            ) {

                action = `

                    <button
                        class="btn btn-success btn-sm"
                        onclick="
                        approveSalary(
                            ${salary.SalaryId}
                        )">

                        ✓ Approve

                    </button>

                `;

            }


            else if (
                status === "Approved"
            ) {

                action = `

                    <button
                        class="btn btn-primary btn-sm"
                        onclick="
                        openPaymentModal(
                            ${salary.SalaryId}
                        )">

                        💰 Pay

                    </button>

                `;

            }


            else if (
                status === "Paid"
            ) {

                action = `

                    <span
                        class="text-success">

                        ✓ Paid

                    </span>

                `;

            }


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        salary.EmployeeName ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        salary.BusinessType ||
                        "-"
                    )}

                </td>


                <td>

                    ${money(
                        salary.MonthlySalary
                    )}

                </td>


                <td>

                    ${salary.PresentDays || 0}

                </td>


                <td>

                    ${salary.LeaveDays || 0}

                </td>


                <td>

                    ${money(
                        salary.AdvanceAmount
                    )}

                </td>


                <td>

                    <strong>

                        ${money(
                            salary.NetSalary
                        )}

                    </strong>

                </td>


                <td>

                    <span
                        class="status ${statusClass}">

                        ${escapeHtml(
                            status
                        )}

                    </span>

                </td>


                <td>

                    ${action}

                </td>

            `;


            table.appendChild(row);

        }
    );

}

async function approveSalary(
    salaryId
) {

    const confirmed =
        confirm(
            "हा Salary record approve करायचा आहे का?"
        );


    if (!confirmed)
        return;


    try {

        await apiRequest(
            `/admin/salary/${salaryId}/approve`,
            {
                method: "PUT",
				 body:
                    JSON.stringify({                        
					    userId:1
                    })
            }
        );


        alert(
            "Salary successfully approved."
        );


        await loadSalaryList();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}

function openPaymentModal(
    salaryId,
    amount = 0
) {

    document
        .getElementById(
            "paymentSalaryId"
        )
        .value =
        salaryId;


    document
        .getElementById(
            "paymentAmount"
        )
        .value =
        amount || "";


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document
        .getElementById(
            "paymentDate"
        )
        .value =
        today;


    document
        .getElementById(
            "paymentModal"
        )
        .style.display =
        "flex";

}

function closePaymentModal() {

    document
        .getElementById(
            "paymentModal"
        )
        .style.display =
        "none";

}


async function paySalary() {

    const salaryId =
        document
            .getElementById(
                "paymentSalaryId"
            )
            .value;


    const amount =
        Number(
            document
                .getElementById(
                    "paymentAmount"
                )
                .value
        );


    const paymentMode =
        document
            .getElementById(
                "paymentMode"
            )
            .value;


    const referenceNo =
        document
            .getElementById(
                "paymentReference"
            )
            .value
            .trim();


    const paymentDate =
        document
            .getElementById(
                "paymentDate"
            )
            .value;


    const remark =
        document
            .getElementById(
                "paymentRemark"
            )
            .value
            .trim();


    if (!salaryId) {

        alert(
            "Salary ID missing."
        );

        return;

    }


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "योग्य payment amount टाका."
        );

        return;

    }


    if (!paymentMode) {

        alert(
            "Payment mode निवडा."
        );

        return;

    }


    try {

        await apiRequest(
            `/admin/salary/${salaryId}/pay`,
            {
                method: "POST",

                body:
                    JSON.stringify({

                        amount,

                        paymentMode,

                        referenceNo,

                        paymentDate,

                        remark

                    })

            }
        );


        alert(
            "Salary payment successfully completed."
        );


        closePaymentModal();


        await loadSalaryList();

    }
    catch (error) {

        console.error(
            error
        );


        alert(
            error.message
        );

    }

}
let pageSize = 10; // Number of contacts per page
        let currentPage = 1; // Current page number
        $(document).ready(function(){
            function isAuthenticated() {
                // Retrieve the token from local storage
                const token = localStorage.getItem('token');
                if(!token) {
                    window.location.href = '/';
                }
            }
            isAuthenticated();
            fetchloggedinUserInfo();
            fetchUserContacts();
            fetchUserGroups();
            $('#searchButton').click(function() {
                handleSearch(); // Trigger search when the search button is clicked
            });
            $('#resetSearch').click(function() {
                resetSearch(); // Trigger search when the search button is clicked
            });

            // $('#groupFilter').change(function() {
            //     const selectedGroup = $(this).val(); // Get the selected value

            //     if (selectedGroup === 'all') {
            //         // If "All Contacts" is selected, fetch all contacts
            //         fetchUserContacts('',currentPage,pageSize,'');
            //     } else {
            //         // Otherwise, fetch contacts for the selected group
            //         // fetchContactsByGroup(selectedGroup);
            //         fetchUserContacts('',currentPage,pageSize,selectedGroup);
            //     }
            // });

            $('#prevPage').on('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    fetchUserContacts({}, currentPage, pageSize);
                }
            });

            $('#nextPage').on('click', function() {
                currentPage++;
                fetchUserContacts({}, currentPage, pageSize);
            });

            // $('#pageSize').on('change', function() {
            //     pageSize = parseInt($(this).val());
            //     currentPage = 1;
            //     $('#groupFilter').val('all');

            //     // fetchUserContacts('/api/contact/', currentPage, pageSize);
            //     fetchUserContacts('', currentPage, pageSize);
            // });
            $('#pageSizeInput').on('keyup', function() {
                pageSize = $(this).val();
                currentPage = 1;
                fetchUserContacts({}, currentPage, pageSize);
            });

            function logOut(){
                localStorage.removeItem('token');
                window.location.href = '/';
            }
            $('#logout').click((event) => {
                event.preventDefault();
                logOut();
            })
        })

        function fetchloggedinUserInfo(){
            let url = '/api/user/profile';
            
            $.ajax({
                type: 'GET',
                url: url,
                headers: {
                    Authorization: `${getToken()}`,
                },
                success: function(response) {
                    const {username} = response.data;
                    $('#loggedInUsername').text(`Welcome, ${username}`);
                },
                error: function(xhr, status, error) {
                    // Handle error response
                    if(xhr.status===403) {
                        $('#contactToast .toast-body').removeClass('bg-success').addClass('bg-danger');
                        $('.toast-body').text(`Your session has expired. Please log in again.`);
                        $('.toast').toast('show');
                        setTimeout(()=>{
                            window.location.href = '/';
                        },3000);
                    }
                    const errorMessage = JSON.parse(xhr.responseText).message;
                    $('#contactToast .toast-body').removeClass('bg-success').addClass('bg-danger');
                    $('.toast-body').text(`${errorMessage}`);
                    $('.toast').toast('show');
                    console.error('Error fetching contacts:', error);
                }
            });
        }
        
        function fetchUserContacts(filter = {},page = 1, pageSize = 10,groupId = '') {
            let url = '/api/contact/';
            const filterData = {
                page: page,
                limit: pageSize,
                groupId: groupId,
                ...filter,
            };
            // console.log("filterData value", filterData);
            $.ajax({
                type: 'POST',
                url: url,
                data: JSON.stringify({...filterData}),
                headers: {
                    Authorization: `${getToken()}`,
                },
                success: function(response) {
                    console.log("response data value is:",response.data);
                    displayContacts(response.data);
                    updatePaginationUI(response.totalPages, currentPage);
                },
                error: function(xhr, status, error) {
                    console.log("Status code:",xhr.status);
                    // Handle error response
                    if(xhr.status===403) {
                        $('#contactToast .toast-body').removeClass('bg-success').addClass('bg-danger');
                        $('.toast-body').text(`Your session has expired. Please log in again.`);
                        $('.toast').toast('show');
                        setTimeout(()=>{
                            window.location.href = '/';
                        },3000);
                    }
                    const errorMessage = JSON.parse(xhr.responseText).message;
                    $('#contactToast .toast-body').removeClass('bg-success').addClass('bg-danger');
                    $('.toast-body').text(`${errorMessage}`);
                    $('.toast').toast('show');
                    console.error('Error fetching contacts:', error);
                }
            });
        }
        
        function handleSearch(){
            let selectedGroup = $("#groupFilter").val(); // Get the selected value
            console.log("selectedGroup Value is " + selectedGroup);
            const name = $('#nameSearch').val();
            const contactNumber = $('#contactSearch').val();
            const date = $('#dateSearch').val();
            let filterData = {};
            if (name) {
                filterData.name = name;
            }
            if (contactNumber) {
                filterData.contact_no = contactNumber;
            }
            if (date) {
                filterData.date = date;
            }
            selectedGroup = (selectedGroup === 'all') ? '' : selectedGroup;
        
            fetchUserContacts(filterData, 1, 10, selectedGroup);
        }

        function resetSearch(){
            // console.log("selectedGroup Value is " + selectedGroup);
            const name = $('#nameSearch').val("");
            const contactNumber = $('#contactSearch').val("");
            const date = $('#dateSearch').val('dd/mm/yyyy');
            fetchUserContacts();
        }

        function displayContacts(contacts) {
            if(!isAuthenticated()){
                window.location.href = '/';
            }
            const tableBody = $('#contactsTable tbody');
            tableBody.empty();
            if (contacts.length === 0) {
                // Display a message if there are no contacts
                tableBody.append(`
                    <tr>
                        <td colspan="4" class="text-center">No contacts found</td>
                    </tr>
                `);
            }
            else {
                    contacts.forEach(contact => {
                        // console.log("Contact: " + JSON.stringify(contact));
                        // const utcTime = '2023-12-11T10:49:35.349Z';
                        const group = (contact.groupId)? contact.groupId.name : "-"
                        const date = new Date(contact.createdAt);

                        const day = String(date.getUTCDate()).padStart(2, '0');
                        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
                        const year = String(date.getUTCFullYear()).slice(-4); // Get last two digits of the year

                        const formattedDate = `${day}-${month}-${year}`;
                        tableBody.append(`
                            <tr>
                                <td>${contact.name}</td>
                                <td>${contact.contactNo}</td>
                                <td>${group}</td>
                                <td>${formattedDate}</td>
                                <td>
                                    <button type="button" id = "editbutton" class="btn btn-primary mr-2" onclick="editContact('${contact._id}','${contact.name}','${contact.contactNo}')">Edit</button>
                                    <button type="button" class="btn btn-danger" onclick="confirmDelete('${contact._id}')">Delete</button>
                                </td>
                            </tr>
                        `)
                    });
            }
        }

        // Function to update pagination UI
        function updatePaginationUI(totalPages, currentPage) {
            if (currentPage === null || totalPages === null){
                currentPage = 1;
                totalPages = 1;
            }
            const pageInfo = $('#pageInfo');
            if (currentPage > totalPages) {
                currentPage = totalPages; // Ensure current page doesn't exceed total pages
            }
            
            pageInfo.text(`Page ${currentPage} of ${totalPages}`);

            const prevButton = $('#prevPage');
            const nextButton = $('#nextPage');

            // Enable/disable previous and next buttons based on current page
            if (currentPage === 1) {
                prevButton.prop('disabled', true);
            } else {
                prevButton.prop('disabled', false);
            }

            if (currentPage === totalPages) {
                nextButton.prop('disabled', true);
            } else {
                nextButton.prop('disabled', false);
            }
        }

        // data-toggle="modal" data-target="#editContactModal"

        function isAuthenticated() {
            // Retrieve the token from local storage
            const token = localStorage.getItem('token');
            // console.log('Authentication Token',token);
            return token !== null; // Check if token exists
        }

        function getToken(){
            return localStorage.getItem('token');
        }
        
        function addContact(){
            // fetchUserGroups();
            const name = $('#contactName').val();
            const conatact_no = $('#contactNumber').val();
            const selectedGroupId = $('#groupDropdown').val();
            let groupId = $('#groupDropdown').val();
            let url = 'api/contact/create';

            // Append groupId as a query parameter if it's not null
            if (groupId !== null) {
                url += `?groupId=${groupId}`;
            }
            console.log('Add Contact',name,conatact_no);
            $.ajax({
                type: 'POST',
                url: url,
                headers: {
                    Authorization: `${getToken()}`,
                },
                data: JSON.stringify({
                    name: name,
                    contactNo: conatact_no,
                }),
                contentType: 'application/json',
                success: function(response) {
                    $('#contactToast .toast-body').removeClass('bg-danger').addClass('bg-success');
                    $('.toast-body').text(`${response.message}`);
                    $('.toast').toast('show');
                    $('#addContactModal').modal('hide');
                    fetchUserContacts();
                },
                error: function(xhr, status, error) {
                    const errorMessage = JSON.parse(xhr.responseText).message;
                    $('#contactToast .toast-body').removeClass('bg-success').addClass('bg-danger');
                    $('.toast-body').text(`${errorMessage}`);
                    $('.toast').toast('show');
                }
            })
            // $('#addContactModal').modal('hide');
        }
        $('#addContactModal').on('hide.bs.modal', function () {
           $('#addContactForm').trigger("reset");
           $('#addContactForm').trigger("change");
        });
        function editContact(contact_id,contact_name,contact_no){
            console.log(contact_name, contact_id);
            $('#editContactId').val(contact_id);
            $('#editName').val(contact_name);
            $('#editContactNo').val(contact_no);
        
            $('#editContactModal').modal('show');
        }
        function updateContact(){
            const contact_name = $('#editName').val();
            const contact_no = $('#editContactNo').val();
            const contact_id = $('#editContactId').val();

            $.ajax({
                type: 'PATCH',
                url: `api/contact/update/${contact_id}`,
                headers: {
                    Authorization: `${getToken()}`,
                },
                data: JSON.stringify({
                    name: contact_name,
                    contactNo: contact_no,
                }),
                contentType: 'application/json',
                success: function(response) {
                    $('#contactToast .toast-body').removeClass('bg-danger').addClass('bg-success');
                    $('.toast-body').text(`${response.message}`);
                    $('.toast').toast('show');
                    $('#editContactModal').modal('hide');
                    fetchUserContacts();
                },
                error: function(xhr, status, error) {
                    const errorMessage = JSON.parse(xhr.responseText).message;
                    $('#contactToast .toast-body').removeClass('bg-success').addClass('bg-danger');
                    $('.toast-body').text(`${errorMessage}`);
                    $('.toast').toast('show');
                }
            })
            // $('#editContactModal').modal('hide');

        }
        function confirmDelete(contact_id) {
            // $('#contactNameToDelete').text(name);
            // Show the confirmation modal
            console.log("confirmDelete==>",contact_id);
            $('#deleteContactId').val(contact_id);
            $('#confirmationModal').modal('show');
        }
        function deleteContact(){
            const contact_id = $('#deleteContactId').val();
            console.log("contact_id Value is:",contact_id);
            $.ajax({
                type: 'DELETE',
                url: `api/contact/${contact_id}`,
                headers: {
                    Authorization: `${getToken()}`,
                },
                contentType: 'application/json',
                success: function(response) {
                    $('#contactToast .toast-body').removeClass('bg-danger').addClass('bg-success');
                    $('.toast-body').text(`${response.message}`);
                    $('.toast').toast('show');
                    fetchUserContacts();
                },
                error: function(xhr, status, error) {
                    const errorMessage = JSON.parse(xhr.responseText).message;
                    $('#contactToast .toast-body').removeClass('bg-success').addClass('bg-danger');
                    $('.toast-body').text(`${errorMessage}`);
                    $('.toast').toast('show');
                }
            })
            $('#confirmationModal').modal('hide');
        }

        function fetchUserGroups() {
            $.ajax({
                type: 'POST',
                url: '/api/group', // Replace with your backend endpoint for fetching user groups
                headers: {
                    Authorization: `${getToken()}` // Replace getToken() with your function to retrieve the token from local storage
                },
                data: JSON.stringify({}),
                success: function(response) {
                    // console.log(response.data);
                    populateDropdownForGroupFilter(response.data);
                    populateDropdownForContactForm(response.data);
                },
                error: function(xhr, status, error) {
                    console.error('Error fetching user groups:', error);
                }
            });
        }

        // Function to populate dropdown with user groups
        function populateDropdownForContactForm(groups) {
            const dropdown = $('#groupDropdown');
            dropdown.empty(); // Clear previous options
            dropdown.append(`<option value="" selected disabled>Select a group (optional)</option>`);
            groups.forEach(function(group) {
                dropdown.append(`<option value="${group._id}">${group.name}</option>`);
            });
        }

        function populateDropdownForGroupFilter(groups) {
            const dropdown = $('#groupFilter');
            dropdown.empty();
            dropdown.append(`<option value="all" selected>All Contacts</option>`);
            groups.forEach(function(group) {
                dropdown.append(`<option value="${group._id}">${group.name}</option>`);
            });
        }
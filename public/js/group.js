let pageSize = 10; // Number of contacts per page
        let currentPage = 1; // Current page number
        $(document).ready(function(){
            function isAuthenticated() {
                const token = localStorage.getItem('token');
                if(!token) {
                    window.location.href = '/';
                }
            }
            isAuthenticated();
            fetchUserContacts();
            $('#searchButton').click(function() {
                handleSearch(); // Trigger search when the search button is clicked
            });

            $('#resetSearch').click(function() {
                resetSearch(); // Trigger search when the search button is clicked
            });

            $('#prevPage').on('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    fetchUserContacts({}, currentPage, pageSize);
                }
            });

            $('#nextPage').on('click', function() {
                currentPage++;
                console.log("next page is clicked");
                // console.log("currentPage = " + currentPage);
                fetchUserContacts({}, currentPage, pageSize);
            });

            // $('#pageSize').on('change', function() {
            //     pageSize = parseInt($(this).val());
            //     currentPage = 1;
            //     fetchUserContacts('/api/group/', currentPage, pageSize);
            // });
            $('#pageSizeInput').on('keyup', function() {
                pageSize = $(this).val();
                currentPage = 1;
                // console.log("newSize Value: " + currentPage);
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

        function fetchUserContacts(filter={},page = 1, pageSize = 10) {
            let url = '/api/group/';
            const filterData = {
                page: page,
                limit: pageSize,
                ...filter,
            };
            $.ajax({
                type: 'POST',
                url: url,
                data: JSON.stringify(filterData),
                headers: {
                    Authorization: `${getToken()}`,
                },
                success: function(response) {
                    displayContacts(response.data);
                    updatePaginationUI(response.totalPages, currentPage);
                },
                error: function(xhr, status, error) {
                    if(xhr.status===403) {
                        $('#contactToast .toast-body').removeClass('bg-success').addClass('bg-danger');
                        $('.toast-body').text(`Your session has expired. Please log in again.`);
                        $('.toast').toast('show');
                        setTimeout(()=>{
                            window.location.href = '/';
                        },3000)
                    }
                    const errorMessage = JSON.parse(xhr.responseText).message;
                    $('#contactToast .toast-body').removeClass('bg-success').addClass('bg-danger');
                    $('.toast-body').text(`${errorMessage}`);
                    $('.toast').toast('show');
                }
            });
        }

        function handleSearch(){
            const name = $('#nameSearch').val();
            const date = $('#dateSearch').val();
            let filterData = {};
            if (name) {
                filterData.name = name;
            }
            if (date) {
                filterData.date = date;
            }
            fetchUserContacts(filterData);
        }

        function resetSearch(){
            // console.log("selectedGroup Value is " + selectedGroup);
            const name = $('#nameSearch').val("");
            const date = $('#dateSearch').val('dd/mm/yyyy');
            fetchUserContacts();
        }

        function displayContacts(groups) {
            const tableBody = $('#contactsTable tbody');
            tableBody.empty();
            if (groups.length === 0) {
                // Display a message if there are no contacts
                tableBody.append(`
                    <tr>
                        <td colspan="4" class="text-center">No Group found</td>
                    </tr>
                `);
            }
            else {
                    groups.forEach(group => {
                        console.log(group);
                        const date = new Date(group.createdAt);
                        const day = String(date.getUTCDate()).padStart(2, '0');
                        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
                        const year = String(date.getUTCFullYear()).slice(-4); // Get last two digits of the year

                        const formattedDate = `${day}-${month}-${year}`;
                        tableBody.append(`
                            <tr>
                                <td>${group.name}</td>
                                <td>${formattedDate}</td>
                                <td>
                                    <button type="button" id = "editbutton" class="btn btn-primary mr-2" onclick="editContact('${group._id}','${group.name}',)">Edit</button>
                                    <button type="button" class="btn btn-danger" onclick="confirmDelete('${group._id}')">Delete</button>
                                </td>
                            </tr>
                        `)
                    });
            }
        }

        function updatePaginationUI(totalPages, currentPage) {
            const pageInfo = $('#pageInfo');
            if (currentPage === null || totalPages === null){
                currentPage = 1;
                totalPages = 1;
            }
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

        function getToken(){
            return localStorage.getItem('token');
        }
        
        function addContact(){
            const group_name = $('#contactName').val();
            console.log('Add Contact',group_name);
            $.ajax({
                type: 'POST',
                url: 'api/group/create',
                headers: {
                    Authorization: `${getToken()}`,
                },
                data: JSON.stringify({
                    group_name: group_name,
                }),
                contentType: 'application/json',
                success: function(response) {
                    $('#contactToast .toast-body').removeClass('bg-danger').addClass('bg-success');
                    $('.toast-body').text(`${response.message}`);
                    $('.toast').toast('show');
                    fetchUserContacts();
                    $('#addContactModal').modal('hide');
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
        function editContact(contact_id,contact_name){
            console.log(contact_id, contact_name);
            $('#editContactId').val(contact_id);
            $('#editName').val(contact_name);
        
            $('#editContactModal').modal('show');
        }
        function updateContact(){
            const group_name = $('#editName').val();
            const group_id = $('#editContactId').val();
            console.log(group_name, group_id);
            $.ajax({
                type: 'PATCH',
                url: `api/group/update/${group_id}`,
                headers: {
                    Authorization: `${getToken()}`,
                },
                data: JSON.stringify({
                    group_name: group_name,
                }),
                contentType: 'application/json',
                success: function(response) {
                    $('#contactToast .toast-body').removeClass('bg-danger').addClass('bg-success');
                    $('.toast-body').text(`${response.message}`);
                    $('.toast').toast('show');
                    fetchUserContacts();
                    $('#editContactModal').modal('hide');
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
                url: `api/group/${contact_id}`,
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
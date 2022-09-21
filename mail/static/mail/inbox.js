document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (document.querySelector('#selectedEmail-view')){
    document.querySelector('#selectedEmail-view').style.display = 'none';
  };

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`

  if (document.querySelector('#selectedEmail-view')){
    document.querySelector('#selectedEmail-view').style.display = 'none';
  };


  // Show the mailbox name

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)

    for (var i =0; i < emails.length; i++){
      const mail = document.createElement('div');
      // mail.id = `${'emails' + [i]}`;
      mail.id = `${emails[i].id}`;
      mail.style.border = '1px solid black';
      mail.style.margin = '2px';

      if (emails[i].read === true){
        mail.style.backgroundColor = 'lightgray'
      } else {
        mail.style.backgroundColor = 'white'
      }

      bold = "<span style = 'font-weight: bold'>"

      mail.innerHTML = 
        `${bold} 
        ${emails[i].sender} </span> -
        ${emails[i].subject}
        <span style = 'float: right'> 
        ${emails[i].timestamp} </span>`;
        
      document.querySelector('#emails-view').append(mail)
      
      var element = document.getElementById(`${emails[i].id}`);
      element.onclick = function (){
        document.querySelector('#emails-view').style.display = 'none';
        select_email = '/emails/' + `${mail.id}`


        fetch(`${select_email}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })

        const newView = document.createElement('div');
        newView.id = "selectedEmail-view";
        document.querySelector(".container").append(newView)

        document.querySelector('#selectedEmail-view').style.display = 'block';
        document.querySelector('#selectedEmail-view').innerHTML = ""
        

        fetch(`${select_email}`)
        .then(response => response.json())
        .then(selected => {
        console.log(selected);

        const email = document.createElement('div');
        email.id = `${selected.id}`;

        
        email.innerHTML = `
        ${bold} From: </span>
        ${selected.sender} <br> 

        ${bold} To: </span> ${selected.recipients} <br> 
        ${bold} Subject: </span> ${selected.subject} <br> 
        ${bold} Body: </span> ${selected.body} <br> 
        ${bold} Timestamp: </span> ${selected.timestamp} <br> `;

        const btn = document.createElement("button");

        function archive (archived){
          btn.onclick = function () {
            fetch(`${select_email}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: archived
              })
            });
            load_mailbox('inbox')
            location.reload()
          }
        }

        if (selected.archived == false){
          btn.innerHTML = "Archive";
          archive(true);
          
        } else { 
          btn.innerHTML = "Unarchive";
          archive(false);
          
        };

        const reply = document.createElement("button");
        reply.innerHTML = ("Reply");

        reply.onclick = function () {
          fetch(`${select_email}`)
          .then(response => response.json())
          .then(email => {
          console.log(email);

          compose_email()
          document.querySelector('#compose-recipients').value = `${email.sender}`;
          document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
          document.querySelector('#compose-body').value = `On ${email.timestamp} - ${email.sender} wrote: "${email.body}"`;
        });
          
        }

        document.querySelector("#selectedEmail-view").append(email)
        document.querySelector("#selectedEmail-view").append(btn)
        document.querySelector("#selectedEmail-view").append(reply)

        
        });
      }
    }
  });
}

function send_email(){

  
    const Recipient = document.querySelector("#compose-recipients").value;
    const Subject = document.querySelector("#compose-subject").value;
    const Body = document.querySelector("#compose-body").value;

  
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: Recipient,
        subject: Subject,
        body: Body
      })
    })

    .then(response => response.json())
    .then(result => {
      load_mailbox('sent');
    });

    return false;
  }

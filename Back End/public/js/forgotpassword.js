async function forgotpassword(e) {
    try{
        
        e.preventDefault();

        let email = e.target.email.value;
     
        let formDetails = {
         email : email
        }
     
        const response = await axios.post('password/forgotpassword',formDetails);
     
        if(response.status == 200){
         document.body.innerHTML += '<div style = "color : red;">Mail Successfully Sent</div>'
        }else {
         throw new Error('Something went wrong');
        }}

    catch(err){
        document.body.innerHTML += `<div style = "color:red;">${err}</div>`
    }
    
}
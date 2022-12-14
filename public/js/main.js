// quantity functions
function minus(quantity){
    if(document.querySelector("#"+quantity).children[1].innerHTML <= 1){
        document.querySelector("#"+quantity).children[1].innerHTML = 1
    }
    else{
        document.querySelector("#"+quantity).children[1].innerHTML--
    }
}
function plus(quantity){
    if(document.querySelector("#"+quantity).children[1].innerHTML >= 10){
        document.querySelector("#"+quantity).children[1].innerHTML = 10
    }
    else{
        document.querySelector("#"+quantity).children[1].innerHTML++
    }
}
// --------------------------------------------------------------------------------------------

// add to cart function
// this function sends the data to backend of the project...
function addToCart(item){

    item.children[1].children[3].innerText = "✅Added";
    
    var imagesrc = item.children[0].currentSrc //image source
    
    var fruitname = item.children[1].children[0].innerText; //fruit name

    var quantity = item.children[1].children[2].children[1].textContent; // quantity

    var gprc = item.children[1].children[1].children[0].textContent
    var requan = item.children[1].children[2].children[1].textContent
    var price = gprc * requan; // price

    const productData ={
        imageSrc : imagesrc,
        fruitName : fruitname,
        Quantity : quantity,
        Price : price
    }
    // console.log(productData);
    $.post( "/cart" , productData)
}


function deleteProduct(id){
    $.post("/cart",id)
}

function send(total){
    var amount = {
        totalprice : total.children[0].textContent
    }
    $.post('/buy', amount)
}
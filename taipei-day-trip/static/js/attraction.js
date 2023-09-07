let page = 0;
let isLoading = false;

function loadNextPage() {
    
    isLoading = true;
    let keyword = searchInput.value;
    
    fetch(`/api/attractions?page=${page}&keyword=${keyword}`).then(function(response) {
    return response.json();
    }).then(function(data) {
        for (let detail of data['data']){
        
        let attractionItemDiv = document.createElement("div");
        attractionItemDiv.className = "attraction__item";

        let attractionItemDetailDiv = document.createElement("div");
        attractionItemDetailDiv.className = "attraction__item__detail";

        let attractionItemDetailTextDiv = document.createElement("div");
        attractionItemDetailTextDiv.className = "attraction__item__detail__text";


        let imageUrl = decodeURIComponent(detail['images'][0]);
        attractionItemDetailDiv.style.background= `url(${imageUrl}) no-repeat center center / cover`;
        
        attractionItemDetailTextDiv.textContent = detail['name'];
        attractionItemDetailDiv.appendChild(attractionItemDetailTextDiv);
        
        attractionItemDiv.appendChild(attractionItemDetailDiv);

        let attractionItemMrtCategoryDiv = document.createElement("div");
        attractionItemMrtCategoryDiv.className = "attraction__item__mrtCategory";

        let mrtDiv=document.createElement("div");
        mrtDiv.className = "attraction__item__mrtCategory__mrt";

        let categoryDiv=document.createElement("div");
        categoryDiv.className = "attraction__item__mrtCategory__category";
        
        mrtDiv.textContent = detail['mrt'];
        attractionItemMrtCategoryDiv.appendChild(mrtDiv);

        categoryDiv.textContent = detail['category'];
        attractionItemMrtCategoryDiv.appendChild(categoryDiv);

        attractionItemDiv.appendChild(attractionItemMrtCategoryDiv);

        let container = document.querySelector(".attraction__container");

        isLoading = false; 
        
        container.appendChild(attractionItemDiv);
        }
        console.log(page);
        if(data["nextPage"]!==null){
            page=data["nextPage"];
        }
        else{
            page++;
        }
    });
    
}

function mrtList() {
    
    fetch('/api/mrts').then(function(response) {
        return response.json();
    }).then(function(data) {
        for (let mrt of data['data']){
            let mrtListContainerItem = document.createElement("div");
            mrtListContainerItem.className = "mrtList__container__sub__item";

            mrtListContainerItem.textContent=mrt;

            mrtListContainerItem.addEventListener("click", function() {

                mrtListContainerItem.classList.add("enlarge");

                setTimeout(function() {
                    mrtListContainerItem.classList.remove("enlarge");
                }, 200);


                let container = document.querySelector(".attraction__container");
                page=0;
                searchInput.value = mrt;
                container.innerHTML = "";
                loadNextPage();
            });

            mrtListContainerItem.addEventListener("mouseenter", function() {
                mrtListContainerItem.style.color = "black"; 
            });
            mrtListContainerItem.addEventListener("mouseleave", function() {
                mrtListContainerItem.style.color = "#666666"; 

            });

            let mrtListContainer = document.querySelector(".mrtList__container__sub");
            mrtListContainer.appendChild(mrtListContainerItem);

        }
    })

}
mrtList()

let leftIcon= document.getElementById('left__icon');
let subContainer = document.querySelector('.mrtList__container__sub');
let rightIcon= document.getElementById('right__icon');

leftIcon.addEventListener("click", function() {
    let currentWidth = subContainer.clientWidth;

    let leftWidth = currentWidth * 0.9;

    subContainer.scrollLeft -= leftWidth;
});

rightIcon.addEventListener("click", function() {

    let currentWidth = subContainer.clientWidth;

    let rightWidth = currentWidth * 0.9;

    subContainer.scrollLeft += rightWidth;
});

let searchButton = document.querySelector(".search__btn");
searchButton.addEventListener("click", function() {
    let container = document.querySelector(".attraction__container");
    page=0;
    keyword = searchInput.value;
    container.innerHTML = "";
    loadNextPage();
    });

    loadNextPage();

window.addEventListener("scroll", function () {
    const lastItem = document.querySelector('.attraction__container:last-child');
    const lastItemBounding = lastItem.getBoundingClientRect();

    // 當捲動到底部時觸發載入下一頁
    if (lastItemBounding.bottom <= window.innerHeight && !isLoading) {
        loadNextPage();
    }
});





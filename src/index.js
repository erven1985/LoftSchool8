// Делаем элементы перетаскиваемыми

VK.init({
    apiId: 6494311
});

function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
    });
}

function callAPI(method, params) {
    params.v = '5.76';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    })
}

(async () => {
    try {
       
        await auth();        

        const friends = await callAPI('friends.get', { fields: 'city, country, photo_100' });
        const template = '{{#each items}}<li class="friend_list_item"><div class="image-wrapper"><img class="friend_image" src={{photo_100}}></div><span class="friend_name">{{first_name}} {{last_name}}</span><a href="#" class="x_button">&#10010;</a></li>{{/each}}';
        const render = Handlebars.compile(template);
        const html = render(friends);
        leftZone.innerHTML = html;

        await activateButtons();

    } catch (e) {
        console.error(e);
    }
})();

const leftZone = document.querySelector('#left-list');
const rightZone = document.querySelector('#right-list');

makeDnD([leftZone, rightZone]);

// Добавление в список путем перетаскивания элемента

function makeDnD(zones) {
    let currentDrag;

    zones.forEach(zone => {
        zone.addEventListener('dragstart', (e) => {
            currentDrag = {
            	leftZone: zone,
            	node: e.target.closest('.friend_list_item')
            };
        });

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        zone.addEventListener('drop', (e) => {
            if (currentDrag) {
                e.preventDefault();

                if (currentDrag.leftZone !== zone) {
                    if (e.target.classList.contains('friend_list_item')) {
                        zone.insertBefore(currentDrag.node, e.target.nextElementSibling);
                    } else {
                        zone.insertBefore(currentDrag.node, zone.lastElementChild);
                    }
                }

                currentDrag.node.lastElementChild.innerHTML =
                zone.getAttribute('id').includes('right') ?
                 '&#10006;' : '&#10010;'

                currentDrag = null;

            }
        });
    })
}

// Добавление в список через кнопку
function activateButtons() {

    const buttons = document.querySelectorAll('.x_button');

    for(let i=0; i<buttons.length;i++) {
        buttons[i].addEventListener('click', () => {
            if(buttons[i].parentElement.parentElement === leftZone) {
                rightZone.insertAdjacentElement('beforeEnd', buttons[i].parentElement)
                buttons[i].innerHTML = '&#10006;';
            } else {
                leftZone.insertAdjacentElement('beforeEnd', buttons[i].parentElement)
                buttons[i].innerHTML = '&#10010;';
            }
            
        })
    }
}

// На нажатии Сохранить все данные сохраняем в LocalStorage

const saveBtn = document.querySelector('#save_btn');
saveBtn.addEventListener('click', () => {

    const leftList = [],
          rightList = [];

    saveAll(leftZone, leftList);
    saveAll(rightZone, rightList);
   
   localStorage.setItem('leftList', JSON.stringify(leftList));
   localStorage.setItem('rightList', JSON.stringify(rightList));
    
    alert('Сохранено в LocalStorage.');
});

// Создание обьектов для сохранения в LocalStorage

function saveAll(zone, list) {
     let arr = zone.children;
        
    for(let i=0;i<arr.length;i++) {
        const [firstname, lastname] = arr[i].getElementsByClassName("friend_name")[0].innerText.split(' ');
        list.push({
            firstname: firstname,
            lastname: lastname,
            image_url: arr[i].getElementsByClassName("friend_image")[0].src
        })
    }
    return list;
}

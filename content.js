(function () {
  function createModal(users) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <div id="user-cards" class="user-cards"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const userCardsContainer = modal.querySelector('#user-cards');
    users.forEach(user => {
      const card = document.createElement('div');
      card.classList.add('user-card');
      card.innerHTML = `
        <h3>${user.login}</h3>
        <p>Token: ${user.token}</p>
      `;
      userCardsContainer.appendChild(card);
    });

    const style = document.createElement('style');
    style.textContent = `
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
      }
      .modal-content {
        background-color: #fff;
        margin: 15% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 600px;
        position: relative;
      }
      .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
      }
      .user-card {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        margin: 10px 0;
        background-color: #f9f9f9;
      }
    `;
    document.head.appendChild(style);

    return modal;
  }

  function addButtonToNavbar() {
    const navbarHeader = document.querySelector('div.navbar-header.flex-container');

    if (navbarHeader) {
      if (!navbarHeader.querySelector('.custom-button')) {
        const newButtonElement = document.createElement('div');
        newButtonElement.classList.add('support-button', 'navbar-header-button', 'custom-button');
        newButtonElement.style.padding = '0px';
        newButtonElement.style.width = '60px';
        newButtonElement.style.height = '100%';

        const iconSvg = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 20V18C13 15.2386 10.7614 13 8 13C5.23858 13 3 15.2386 3 18V20H13ZM13 20H21V19C21 16.0545 18.7614 14 16 14C14.5867 14 13.3103 14.6255 12.4009 15.6311M11 7C11 8.65685 9.65685 10 8 10C6.34315 10 5 8.65685 5 7C5 5.34315 6.34315 4 8 4C9.65685 4 11 5.34315 11 7ZM18 9C18 10.1046 17.1046 11 16 11C14.8954 11 14 10.1046 14 9C14 7.89543 14.8954 7 16 7C17.1046 7 18 7.89543 18 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        newButtonElement.innerHTML = iconSvg;
        const modal = createModal([]);

        newButtonElement.addEventListener('click', () => {
          chrome.storage.sync.get({ urlAPI: '', auth: {} }, function (settings) {
            const urlAPI = settings.urlAPI + "/api/authentication";

            chrome.storage.sync.get({ users: [] }, function (result) {
              modal.querySelector('#user-cards').innerHTML = '';
              result.users.forEach(user => {
                const card = document.createElement('div');
                card.classList.add('user-card');
                card.innerHTML = `
                  <h3>${user.token}</h3>
                  <p>Login: ${user.login}</p>
                  <p>Password: ${user.password}</p>
                  <button class="fetch-button" data-password="${user.password}" data-login="${user.login}" data-token="${user.token}">Авторизироваться</button>
                `;
                modal.querySelector('#user-cards').appendChild(card);
              });
              modal.style.display = 'block';

              modal.querySelectorAll('.fetch-button').forEach(button => {
                button.addEventListener('click', function () {
                  const login = this.getAttribute('data-login');
                  const password = this.getAttribute('data-password');
                  const token = this.getAttribute('data-token');

                  const formData = new FormData();
                  formData.append("j_username", login);
                  formData.append("j_password", password);
                  formData.append("auth_code", "");
                  formData.append("remember-me", "true");

                  // Отладка
                  console.log('Отправка данных:', {
                    method: 'POST',
                    headers: {
                      'Accept': '*/*'
                    },
                    body: formData
                  });

                  fetch(urlAPI, {
                    method: 'POST',
                    headers: {
                      'Accept': '*/*'
                    },
                    body: formData
                  })
                    .then(response => response.text())
                    .then(data => {
                      console.log('Запрос выполнен:', data);
                      window.location.reload(); // Перезагрузка страницы
                    })
                    .catch(error => {
                      console.error('Ошибка запроса:', error);
                    });
                });
              });
            });
          });
        });

        window.addEventListener('click', (event) => {
          if (event.target === modal) {
            modal.style.display = 'none';
          }
        });

        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
          modal.style.display = 'none';
        });

        navbarHeader.appendChild(newButtonElement);
        console.log('Кнопка добавлена в навигацию');
      } else {
        console.log('Кнопка уже добавлена');
      }
    } else {
      console.log('Элемент <div> с классом "navbar-header flex-container" не найден');
    }
  }

  const observer = new MutationObserver((mutationsList, observer) => {
    const navbarHeader = document.querySelector('div.navbar-header.flex-container');
    if (navbarHeader) {
      addButtonToNavbar();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', () => {
    addButtonToNavbar();
  });
})();

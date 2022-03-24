const BASE_API_URL = 'https://parallelum.com.br/fipe/api/v1';
const TYPES = ['motos', 'carros', 'caminhoes'];
const UNSELECTED_VALUE = 'unselected';
const QUERY_KEYS = { brand: 'b', model: 'm', year: 'y' };

const header = document.querySelector('header');
const main = document.querySelector('main');

const selectBrands = document.querySelector('#brands select');
selectBinding(selectBrands, QUERY_KEYS.brand);

const selectModels = document.querySelector('#models select');
selectBinding(selectModels, QUERY_KEYS.model);

const selectYears = document.querySelector('#years select');
selectBinding(selectYears, QUERY_KEYS.year);

function selectBinding(select, queryKey) {
  select.addEventListener('change', () => {
    const { query } = getRoute();
  
    if (select.value === UNSELECTED_VALUE) {
      query.delete(queryKey);
    } else {
      query.set(queryKey, select.value);
    }
  });
}

function createOption(innerText, value) {
  const option = document.createElement('option');
  option.innerText = innerText;
  option.value = value;
  return option;
}

function getRoute() {
  const [route, query] = window.location.hash.substring(1).split('?');
  const [, ...paths] = route.split('/');

  const searchParams = new URLSearchParams(query);

  return {
    paths,
    query: {
      get: (name) => searchParams.get(name),
      set(name, value) {
        searchParams.set(name, value);
        window.location.hash = `#/${header.id}?${searchParams.toString()}`;
      },
      delete(name) {
        searchParams.delete(name);
        window.location.hash = `#/${header.id}?${searchParams.toString()}`.replace(/\?$/, '');
      },
    },
  };
}

navigateTo();
window.addEventListener('hashchange', navigateTo);
async function navigateTo() {
  const { paths: [type], query } = getRoute();

  if (!type || !TYPES.includes(type)) {
    window.location.hash = `#/${TYPES[0]}`;
    return;
  }

  if (header.id !== type) {
    header.id = type;

    document.querySelector('nav > ul > li > a.active')?.classList?.remove('active');
    document.querySelector(`[href="#/${type}"]`)?.classList?.add('active');
  }

  const brand = query.get(QUERY_KEYS.brand);
  if (selectBrands.value !== brand) {
    selectBrands.querySelectorAll('option').forEach((option) => option.remove());
    selectBrands.appendChild(createOption('Selecione uma marca', UNSELECTED_VALUE));

    if (header.id) {
      const response = await fetch(`${BASE_API_URL}/${type}/marcas`);
      (await response.json()).forEach(({ nome, codigo }) => {
        selectBrands.appendChild(createOption(nome, codigo));
      });
    }

    if (brand) {
      selectBrands.value = brand;
    }
  }

  const model = query.get(QUERY_KEYS.model);
  if (selectModels.value !== model) {
    selectModels.querySelectorAll('option').forEach((option) => option.remove());
    selectModels.appendChild(createOption('Selecione um modelo', UNSELECTED_VALUE));

    selectModels.disabled = selectBrands.value === UNSELECTED_VALUE;
    if (selectBrands.value !== UNSELECTED_VALUE) {
      const response = await fetch(`${BASE_API_URL}/${type}/marcas/${brand}/modelos`);
      (await response.json()).modelos.forEach(({ nome, codigo }) => {
        selectModels.appendChild(createOption(nome, codigo));
      });
    }

    if (model) {
      selectModels.value = model;
    }
  }

  const year = query.get(QUERY_KEYS.year);
  if (selectYears.value !== year) {
    selectYears.querySelectorAll('option').forEach((option) => option.remove());
    selectYears.appendChild(createOption('Selecione um ano', UNSELECTED_VALUE));

    selectYears.disabled = selectModels.value === UNSELECTED_VALUE;
    if (selectModels.value !== UNSELECTED_VALUE) {
      const response = await fetch(`${BASE_API_URL}/${type}/marcas/${brand}/modelos/${model}/anos`);
      (await response.json()).forEach(({ nome, codigo }) => {
        selectYears.appendChild(createOption(nome, codigo));
      });
    }

    if (year) {
      selectYears.value = year;
    }
  }

  main.style.display = 'none';
  if (brand && model && year) {
    main.style.display = null;

    const response = await fetch(`${BASE_API_URL}/${type}/marcas/${brand}/modelos/${model}/anos/${year}`);
    Object.entries(await response.json()).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (!element) return;

      element.innerText = value;
    });
  }
};

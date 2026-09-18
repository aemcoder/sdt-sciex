/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/contact-information/contact-information.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import getPartnersData from '../../scripts/sx/blocks-controllers/partner-controller.js';

export default async function decorate(block) {

  // Get heading text from block through author
  const headingText = block.querySelector("p")?.textContent || "";

  // Fetch data from controller (regions → countries → companies)
  const data = await getPartnersData();

  // Inject full UI structure into block
  block.innerHTML = `
    <div class="contact-wrapper">
      <h2 class="contact-title">${headingText}</h2>      
      <div class="search-wrapper">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M11 3.06348C15.4181 3.06348 18.9997 6.72141 19 11.2334C19 13.3075 18.241 15.1997 16.9941 16.6406L20.3574 20.0752L20.707 20.4326L19.9922 21.1318L19.6426 20.7744L16.2949 17.3555C14.884 18.6295 13.0313 19.4043 11 19.4043L10.5879 19.3936C6.36114 19.1745 3 15.6045 3 11.2334C3.00034 6.72141 6.58193 3.06348 11 3.06348ZM11 4.06348C7.15396 4.06348 4.00034 7.25375 4 11.2334C4 15.2133 7.15375 18.4043 11 18.4043C14.8463 18.4043 18 15.2133 18 11.2334C17.9997 7.25375 14.846 4.06348 11 4.06348Z" fill="#141414"/>
        </svg>
        <input
            type="text"
            placeholder="Search by country"
            class="search-input"
            id="search-input"
        />
      </div>
      <button class="clear-button"></button>
      <div class="filters">
        <div class="custom-select region-select">
          <div class="select-trigger">Select Region <span class="arrow"></span></div>
          <div class="options"></div>
        </div>

        <div class="custom-select country-select">
          <div class="select-trigger">Select Country <span class="arrow"></span></div>
          <div class="options"></div>
        </div>
      </div>
      <div class="cards"></div>
    </div>
  `;

  // Cache frequently used DOM elements
  const regionWrapper = block.querySelector(".region-select");
  const countryWrapper = block.querySelector(".country-select");
  const cardsContainer = block.querySelector(".cards");
  const searchInput = block.querySelector(".search-input");
  const filter = document.querySelector(".filters");

  // State variables
  let selectedRegion = "";
  let selectedCountry = "";
  
  // Add Clear button UI
  const clearButton=block.querySelector(".clear-button");
  clearButton.innerHTML = `Clear All <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
    <path d="M13 13.5L3.0001 3.5001" stroke="#3C8DFF"/>
    <path d="M13 3.5L3.0001 13.4999" stroke="#3C8DFF"/>
  </svg>`;

  //custom dropdown setup
  function setupCustomSelect(wrapper, items, onSelect) {
    const trigger = wrapper.querySelector(".select-trigger");
    const optionsContainer = wrapper.querySelector(".options");

    // Reset previous options
    optionsContainer.innerHTML = "";

    // Create dropdown options dynamically
    items.forEach((item) => {
      const option = document.createElement("div");
      option.className = "option";
      option.textContent = item;

      // Handle option click
      option.addEventListener("click", () => {
        trigger.firstChild.textContent = item; // Update label
        wrapper.classList.remove("open");      // Close dropdown
        onSelect(item);                        // Execute callback
      });

      optionsContainer.appendChild(option);
    });

    // Toggle dropdown open/close
    trigger.onclick = () => {  
      wrapper.classList.toggle("open");
    };
  }

  /**
   * Global click listener
   * Closes any open dropdown when clicking outside
   */
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".custom-select").forEach((dropdown) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
      }
    });
  });

  /**
   * renderCards
   * Renders company cards based on filtered data
   */
  function renderCards(filteredData, showUSDefault = false) {

    // Show or hide clear button depending on active filters
    if (selectedRegion || selectedCountry || searchInput.value) {
      clearButton.style.display = "flex";
      filter.style.marginTop = "0px";
    } else {
      clearButton.style.display = "none";
      filter.style.marginTop = "40px";
    }

    // Clear previous cards
    cardsContainer.innerHTML = "";

    /**
     * Default Behavior:
     * If nothing selected or searched → show United States companies
     */
    if (showUSDefault && !selectedRegion && !selectedCountry && !searchInput.value) {
      const usRegion = data.find(r => r.region === "North America");
      const usCountry = usRegion?.countries.find(c => c.country === "United States");

      if (usCountry) {
        usCountry.companies.forEach(company => {
          const card = document.createElement("div");
          card.className = "contact-card";
          card.innerHTML = `
          ${company.name?.trim() ? `<h3 class="company-name">${company.name.trim()}</h3>` : ""}
          ${company.productLine?.trim() ? `<p class="product-line">${company.productLine.trim()}</p>` : ""}
          ${company.address?.trim() ? `<p class="address">${company.address.trim()}</p>` : ""}
          ${company.hours?.trim() ? `<p class="hours">${company.hours.trim()}</p>` : ""}
          ${company.phone?.trim() ? `<p class="phone">Phone: ${company.phone.trim()}</p>` : ""} 
          ${company.fax?.trim() ? `<p class="fax">Fax: ${company.fax.trim()}</p>` : ""}  
          ${company.email?.trim() ? `<p class="email">Email: ${company.email.trim()}</p>` : ""}
          ${company.website?.trim()
                        ? `<a href="${company.website.trim()}" target="_blank" class="website-link">${company.website.trim()}</a>`
                        : ""}
              `;
          cardsContainer.appendChild(card);
        });
        return;
      }
    }

    // Render filtered companies
    filteredData.forEach(region => {
      region.countries.forEach(country => {
        country.companies.forEach(company => {
          const card = document.createElement("div");
          card.className = "contact-card";
          card.innerHTML = `
          ${company.name?.trim() ? `<h3 class="company-name">${company.name.trim()}</h3>` : ""}
          ${company.productLine?.trim() ? `<p class="product-line">${company.productLine.trim()}</p>` : ""}
          ${company.address?.trim() ? `<p class="address">${company.address.trim()}</p>` : ""}
          ${company.hours?.trim() ? `<p class="hours">${company.hours.trim()}</p>` : ""}
          ${company.phone?.trim() ? `<p class="phone">Phone: ${company.phone.trim()}</p>` : ""} 
          ${company.fax?.trim() ? `<p class="fax">Fax: ${company.fax.trim()}</p>` : ""}  
          ${company.email?.trim() ? `<p class="email">Email: ${company.email.trim()}</p>` : ""}
          ${company.website?.trim() 
            ? `<a href="${company.website.trim()}" target="_blank" class="website-link">${company.website.trim()}</a>` 
            : ""}
          `;
          cardsContainer.appendChild(card);
        });
      });
    });
  }

  /**
   * filterData
   * Core filtering logic
   * - If search has value → filter by country name (ignores dropdowns)
   * - Else → filter by selected region and country
   */
  function filterData() {
    const searchValue = searchInput.value.trim().toLowerCase();

    let filtered;

    if (searchValue) {
      // Reset dropdown selections when searching
      selectedRegion = "";
      selectedCountry = "";

      regionWrapper.querySelector(".select-trigger").firstChild.textContent = "Select Region ";
      countryWrapper.querySelector(".select-trigger").firstChild.textContent = "Select Country ";

      // Filter by country name across all regions
      filtered = data
        .map(region => ({
          ...region,
          countries: region.countries.filter(c =>
            c.country.toLowerCase().includes(searchValue)
          )
        }))
        .filter(region => region.countries.length > 0);

    } else {
      // Filter based on selected region & country
      filtered = data
        .filter(region => !selectedRegion || region.region === selectedRegion)
        .map(region => ({
          ...region,
          countries: region.countries
          .filter(c =>
            !selectedCountry || c.country === selectedCountry
          )
        }))
        .filter(region => region.countries.length > 0);
    }

    renderCards(filtered, true);
  }

  /**
   * Clear Button Logic
   * - Reset region
   * - Reset country
   * - Clear search
   * - Reset dropdown labels
   */
  clearButton.addEventListener("click", () => {
    selectedRegion = "";
    selectedCountry = "";
    searchInput.value = "";

    regionWrapper.querySelector(".select-trigger").firstChild.textContent = "Select Region ";
    countryWrapper.querySelector(".select-trigger").firstChild.textContent = "Select Country ";

    setupCustomSelect(countryWrapper, ["Select Country"], () => {});
    filterData();
  });

  // Initialize Region Dropdown
  setupCustomSelect(
    regionWrapper,
    ["Select Region", ...data.map(r => r.region)],
    (value) => {
      selectedRegion = value === "Select Region" ? "" : value;
      selectedCountry = "";
      searchInput.value = "";

      countryWrapper.querySelector(".select-trigger").firstChild.textContent = "Select Country ";

      const regionObj = data.find(r => r.region === selectedRegion);

      setupCustomSelect(
        countryWrapper,
        selectedRegion ? ["Select Country", ...regionObj.countries.map(c => c.country)] : ["Select Country"],
        (countryVal) => {
          selectedCountry = countryVal === "Select Country" ? "" : countryVal;
          filterData();
        }
      );

      filterData();
    }
  );

  /**
   * Search Input Listener
   * - Clears dropdown selections when typing
   * - Filters based on country name
   */
  searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.trim().toLowerCase();

    if (searchValue) {
    // Clear dropdown selections
      selectedRegion = "";
      selectedCountry = "";

    // Reset dropdown labels
      regionWrapper.querySelector(".select-trigger").firstChild.textContent = "Select Region ";
      countryWrapper.querySelector(".select-trigger").firstChild.textContent = "Select Country ";

      setupCustomSelect(countryWrapper, ["Select Country"], () => {});
    }

    filterData();
  });

  // Initial render → Show United States by default
  renderCards(data, true);
}
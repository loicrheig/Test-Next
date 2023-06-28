function FilterPanel(){

    // The value w-x for map-container need to be 1-X for slideover-container

    function toggleSlideover(){
        document.getElementById('slideover-container').classList.toggle('invisible');
        document.getElementById('slideover').classList.toggle('translate-x-full');
        document.getElementById('map-container').classList.toggle('w-3/4');
        document.getElementById('map-container').classList.toggle('w-full');
    }

    return (
        <div>
            <div onClick={toggleSlideover} className="cursor-pointer h-9 px-5 py-2 text-sm border bg-gray-50 text-gray-500 hover:bg-gray-100 rounded border-gray-300">Filtre</div>
            <div id="slideover-container" className="w-1/4 h-full fixed invisible inset-y-0 right-0">
                <div id="slideover" className="w-full bg-white h-full absolute right-0 duration-300 ease-out transition-all translate-x-full">
                    <div onClick={toggleSlideover} className="absolute cursor-pointer text-gray-600 top-0 w-8 h-8 flex items-center justify-center right-0 mt-5 mr-5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

export {FilterPanel};
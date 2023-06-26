function descriptionScrollable(description) {
    return (
        <div className="overflow-y-auto h-20">
            {description}
        </div>
    )
}

function OfferPanel({offer}){
    let descriptionComponent;
    if (offer.Description == null) {
        return <div></div>;
    }
    // Check if description size is too long
    if (offer.Description.length > 100) {
        descriptionComponent =  descriptionScrollable(offer.Description);
    }
    else {
        descriptionComponent = <div className="offerDescription">{offer.Description}</div>;
    }

    return (
        <div>
            <div className="text-2xl font-bold mb-5">{offer.Title} - {offer.Address}</div>
            <div className="columns-2 mb-5">
                fsfsddsffdsfdssdfsfdsdfsd
                {descriptionComponent}
            </div>
            <div>
                <div className="text-1xl font-bold mb-5">Informations techniques</div>
                <div class="grid gap-1 grid-cols-2">
                    <div className="text-1xl font-bold">Type de bien</div>
                    <div className="text-1xl">{offer.Type}</div>
                    <div className="text-1xl font-bold">Surface</div>
                    <div className="text-1xl">{offer.Surface} m²</div>
                    <div className="text-1xl font-bold">Prix</div>
                    <div className="text-1xl">{offer.Price} CHF</div>
                    <div className="text-1xl font-bold">Nombre de pièces</div>
                    <div className="text-1xl">{offer.NbRooms}</div>
                    <div className="text-1xl font-bold">Gérance</div>
                    <div className="text-1xl">{offer.Management}</div>
                </div>
            </div>
        </div>
    )
}

export {OfferPanel};
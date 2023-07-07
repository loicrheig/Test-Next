function contentScrollable(element, height = "h-20") {
  let className = "overflow-y-auto " + height + " mb-5";
  return <div className={className}>{element}</div>;
}

const onImageError = (e) => {
  e.target.src = "/imgNotAvailable.png";
};

function OfferPanel({ offer }) {
  let descriptionComponent;
  let imagesComponent;
  // array of images
  let imagesContent = [];

  offer.imageUrls = Object.values(offer.ImageUrls);

  if (offer.Description == null) {
    descriptionComponent = <div></div>;
  }

  // Check if description size is too long
  if (offer.Description.length > 100) {
    descriptionComponent = contentScrollable(offer.Description);
  } else {
    descriptionComponent = <div>{offer.Description}</div>;
  }

  for (let i = 0; i < offer.imageUrls.length; i++) {
    // Check that the img url do not give a 404
    if (offer.imageUrls[i].includes("404")) {
      continue;
    }

    imagesContent[i] = (
      <img key={i} src={offer.imageUrls[i]} onError={onImageError} />
    );
  }

  if (imagesContent.length > 1) {
    imagesComponent = contentScrollable(imagesContent, "h-64");
  } else {
    imagesComponent = <div className="mb-5">{imagesContent}</div>;
  }

  return (
    <div>
      <div className="text-2xl font-bold mb-5">
        {offer.Title} - {offer.Address}
      </div>
      {imagesComponent}
      {descriptionComponent}
      <div className="text-1xl font-bold mb-5">Informations techniques</div>
      <div className="grid gap-1 grid-cols-2">
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
  );
}

export { OfferPanel };

import styles from "./offer-panel.module.css";

function contentScrollable(element, rightScroll, height = "h-full") {
  let containerClassName = "overflow-y-auto " + height + " mb-5 " + rightScroll;

  if (!rightScroll) {
    containerClassName += " " + styles.leftScroll;
  }

  return <div className={containerClassName}>{element}</div>;
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
    descriptionComponent = <></>;
  }
  // Check if description size is too long
  else if (offer.Description.length > 100) {
    descriptionComponent = contentScrollable(offer.Description, false, "h-48");
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
    imagesComponent = contentScrollable(imagesContent, false, "h-64");
  } else {
    imagesComponent = <div className="mb-5">{imagesContent}</div>;
  }

  const titleComponent = (
    <div className="text-2xl font-bold mb-5">
      {offer.Title} - {offer.Address}
    </div>
  );

  const parameterMissing = "Pas de spécification";

  offer.Type = offer.Type || parameterMissing;
  offer.NbRooms = offer.NbRooms || parameterMissing;
  offer.Management = offer.Management || parameterMissing;
  offer.Surface = offer.Surface
    ? offer.Surface.toString() + " m²"
    : parameterMissing;
  offer.Price = offer.Price
    ? offer.Price.toString() + " CHF"
    : parameterMissing;

  console.log(offer.Schools);

  return contentScrollable(
    <div className={styles.offerHeight}>
      {titleComponent}
      {imagesComponent}
      {descriptionComponent}
      <div className="text-1xl font-bold mb-5">Informations techniques</div>
      <div className="grid gap-1 grid-cols-2">
        <div className="text-1xl font-bold">Type de bien</div>
        <div className="text-1xl">{offer.Type}</div>
        <div className="text-1xl font-bold">Surface</div>
        <div className="text-1xl">{offer.Surface}</div>
        <div className="text-1xl font-bold">Prix</div>
        <div className="text-1xl">{offer.Price}</div>
        <div className="text-1xl font-bold">Nombre de pièces</div>
        <div className="text-1xl">{offer.NbRooms}</div>
        <div className="text-1xl font-bold">Gérance</div>
        <div className="text-1xl">{offer.Management}</div>
      </div>
      <div className="text-1xl font-bold mb-5">Structures environnantes</div>
      <div className="grid gap-1 grid-cols-2">
        <div className="text-1xl font-bold">Ecoles</div>
        <ul className="text-1xl">
          {offer.Schools.map((school) => {
            <li>{school.Name}</li>;
          })}
        </ul>
        <div className="text-1xl font-bold">Magasins</div>
        <ul className="text-1xl">
          {offer.Shops.map((shop) => {
            <li>{shop.Name}</li>;
          })}
        </ul>
        <div className="text-1xl font-bold">Transports publiques</div>
        <ul className="text-1xl">
          {offer.PublicTransports.map((tran) => {
            <li>{tran.Name}</li>;
          })}
        </ul>
        <div className="text-1xl font-bold">Points d'intérêt</div>
        <ul className="text-1xl">
          {offer.InterestPoints.map((point) => {
            <li>{point.Name}</li>;
          })}
        </ul>
      </div>
    </div>,
    true
  );
}

export { OfferPanel };

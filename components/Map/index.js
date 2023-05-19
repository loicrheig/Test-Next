// On est obligé de désactiver le serverSide Rendering car LeafLet utilise des éléments qui ne sont pas disponibles côté serveur
// Sinon : ReferenceError: window is not defined
//"use client";
import dynamic from 'next/dynamic'
const Map = dynamic(() => import('./map'), {
    ssr: false
});

export default Map;
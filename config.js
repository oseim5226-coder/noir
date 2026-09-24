// STORE SETTINGS. To make a new store, edit this file only.
window.STORE = {
  shopName: 'NOIR',
  tagline: 'Objects for after dark.',
  description: "NOIR is a small collection of fragrance, ladies' bags, skincare and accessories.",
  whatsapp: '233598119357', // country code + number, no + or spaces
  currency: 'GHS',
  locale: 'en-GH',
  accent: '#c22f45',
  collectionTitle: 'The collection',
  footerNote: 'Demo store. Products and prices are placeholders.',
  orderFields: ['Name:', 'Delivery location:'], // lines customers fill in before sending
  promises: [
    { title: 'Delivery', text: 'We deliver in Accra and nationwide. The fee is confirmed on WhatsApp.' },
    { title: 'Easy returns', text: 'Message us within 7 days if something is not right.' },
    { title: 'Gift ready', text: 'Black box, black ribbon, and no prices inside.' }
  ],
  // Each product: id (unique, no spaces), name, cat (category), price (number), note (optional).
  // Use img: 'images/name.jpg' for a photo, or art: 'perfume' for a line drawing.
  products: [
    { id:'nuit',     name:'Nuit Eau de Parfum',      cat:'Fragrance',   price:850,  art:'perfume',  note:'Black pepper, oud and smoke. 50 ml.' },
    { id:'ambre',    name:'Ambre Rose',              cat:'Fragrance',   price:750,  art:'perfume2', note:'Amber, rose and vanilla. 50 ml.' },
    { id:'lune',     name:'Lune Blanche',            cat:'Fragrance',   price:650,  art:'perfume3', note:'Jasmine, white musk and cedar. 30 ml.' },
    { id:'vesper',   name:'Vesper Tote',             cat:'Bags',        price:1800, art:'tote',     note:'Full-grain leather with a suede lining.' },
    { id:'soir',     name:'Soir Clutch',             cat:'Bags',        price:900,  art:'clutch',   note:'Satin finish with a detachable chain.' },
    { id:'cinder',   name:'Cinder Wallet',           cat:'Bags',        price:600,  art:'wallet',   note:'Six card slots and one flat pocket.' },
    { id:'velours',  name:'Velours Face Cream',      cat:'Skincare',    price:350,  art:'jar',      note:'Rich daily moisturizer with shea butter. 50 ml.' },
    { id:'eclat',    name:'Éclat Vitamin C Serum',   cat:'Skincare',    price:300,  art:'serum',    note:'Lightweight daily serum. 30 ml.' },
    { id:'douceur',  name:'Douceur Gentle Cleanser', cat:'Skincare',    price:180,  art:'tube',     note:'Soft foaming face wash. 100 ml.' },
    { id:'meridian', name:'Meridian Chronograph',    cat:'Watches',     price:4500, art:'watch',    note:'Steel case, black dial, 40 mm.' },
    { id:'shade',    name:'Shade No. 9 Sunglasses',  cat:'Accessories', price:700,  art:'shades',   note:'Black acetate frame, smoked lenses.' },
    { id:'signet',   name:'Onyx Signet Ring',        cat:'Accessories', price:1200, art:'ring',     note:'Sterling silver with a polished onyx face.' },
    { id:'midnight', name:'Midnight Silk Scarf',     cat:'Accessories', price:450,  art:'scarf',    note:'Hand-rolled edges, 90 cm square.' },
    { id:'ink',      name:'Ink Fountain Pen',        cat:'Accessories', price:900,  art:'pen',      note:'Matte black resin with a steel nib.' }
  ]
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const reviews = [
  {
    name: "Sophie Martin",
    dateAdded: new Date("2026-10-28"),
    photoUrl: "https://i.pravatar.cc/150?img=47",
    message: "Excellent airport transfer from Agadir airport to Taghazout. Our driver was waiting for us, helped with our luggage and made the journey very comfortable. Highly recommended!",
    messageFr: "Excellent transfert depuis l'aéroport d'Agadir jusqu'à Taghazout. Notre chauffeur nous attendait, nous a aidés avec les bagages et le trajet était très confortable.",
    rating: 5,
  },
  {
    name: "James Wilson",
    dateAdded: new Date("2026-10-25"),
    photoUrl: "https://i.pravatar.cc/150?img=12",
    message: "Everything was perfectly organized. We booked our airport pickup and quad biking experience in advance. Communication was excellent and the whole experience was smooth.",
    messageFr: "Tout était parfaitement organisé. Nous avons réservé notre transfert aéroport et notre excursion en quad à l'avance. Excellente communication.",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    dateAdded: new Date("2026-10-22"),
    photoUrl: "https://i.pravatar.cc/150?img=44",
    message: "A wonderful experience in Morocco! The driver was friendly, punctual and very professional. The private transfer made arriving in a new country so much easier.",
    messageFr: "Une merveilleuse expérience au Maroc ! Le chauffeur était sympathique, ponctuel et très professionnel. Le transfert privé a vraiment facilité notre arrivée.",
    rating: 5,
  },
  {
    name: "Lucas Bernard",
    dateAdded: new Date("2026-10-19"),
    photoUrl: "https://i.pravatar.cc/150?img=14",
    message: "Great service from start to finish. We traveled from Agadir to Essaouira and everything went smoothly. Comfortable vehicle and a very helpful driver.",
    messageFr: "Excellent service du début à la fin. Nous avons voyagé d'Agadir à Essaouira sans aucun problème. Véhicule confortable et chauffeur très serviable.",
    rating: 5,
  },
  {
    name: "Olivia Parker",
    dateAdded: new Date("2026-10-16"),
    photoUrl: "https://i.pravatar.cc/150?img=49",
    message: "We loved the Paradise Valley excursion! Beautiful scenery, a comfortable ride and a great local experience. Definitely one of the highlights of our trip.",
    messageFr: "Nous avons adoré l'excursion à Paradise Valley ! Des paysages magnifiques, un trajet confortable et une belle expérience locale.",
    rating: 5,
  },
  {
    name: "Daniel Cooper",
    dateAdded: new Date("2026-10-12"),
    photoUrl: "https://i.pravatar.cc/150?img=13",
    message: "Very reliable airport pickup. Our flight was slightly delayed, but the driver kept in touch and was there when we arrived. Really appreciated the service.",
    messageFr: "Transfert aéroport très fiable. Notre vol avait un peu de retard, mais le chauffeur est resté en contact avec nous et nous attendait à notre arrivée.",
    rating: 5,
  },
  {
    name: "Chloe Anderson",
    dateAdded: new Date("2026-10-08"),
    photoUrl: "https://i.pravatar.cc/150?img=45",
    message: "A lovely way to discover Morocco. The team helped us organize transport and activities around Taghazout. Friendly people and great attention to detail.",
    messageFr: "Une belle façon de découvrir le Maroc. L'équipe nous a aidés à organiser les transports et les activités autour de Taghazout. Une équipe très sympathique.",
    rating: 5,
  },
  {
    name: "Camille Laurent",
    dateAdded: new Date("2026-10-05"),
    photoUrl: "https://i.pravatar.cc/150?img=32",
    message: "Un service impeccable ! Le chauffeur était très ponctuel et le véhicule était propre et confortable. Notre arrivée à Agadir s'est déroulée sans stress.",
    messageFr: "Un service impeccable ! Le chauffeur était très ponctuel et le véhicule était propre et confortable. Notre arrivée à Agadir s'est déroulée sans stress.",
    rating: 5,
  },
  {
    name: "Thomas Moreau",
    dateAdded: new Date("2026-10-02"),
    photoUrl: "https://i.pravatar.cc/150?img=11",
    message: "Nous avons réservé un transfert vers Imsouane. Le trajet était agréable et le chauffeur connaissait parfaitement la région. Je recommande vivement.",
    messageFr: "Nous avons réservé un transfert vers Imsouane. Le trajet était agréable et le chauffeur connaissait parfaitement la région. Je recommande vivement.",
    rating: 5,
  },
  {
    name: "Léa Dubois",
    dateAdded: new Date("2026-09-28"),
    photoUrl: "https://i.pravatar.cc/150?img=48",
    message: "Très belle expérience avec MH Traveling. Nous avons également pu organiser une sortie en quad. Tout était simple, rapide et bien organisé.",
    messageFr: "Très belle expérience avec MH Traveling. Nous avons également pu organiser une sortie en quad. Tout était simple, rapide et bien organisé.",
    rating: 5,
  },
  {
    name: "Antoine Petit",
    dateAdded: new Date("2026-09-24"),
    photoUrl: "https://i.pravatar.cc/150?img=15",
    message: "Un accueil chaleureux dès notre arrivée à l'aéroport. Le chauffeur était professionnel et le trajet jusqu'à notre hébergement à Taghazout était parfait.",
    messageFr: "Un accueil chaleureux dès notre arrivée à l'aéroport. Le chauffeur était professionnel et le trajet jusqu'à notre hébergement à Taghazout était parfait.",
    rating: 5,
  },
  {
    name: "Manon Garcia",
    dateAdded: new Date("2026-09-20"),
    photoUrl: "https://i.pravatar.cc/150?img=43",
    message: "Nous avons beaucoup apprécié la disponibilité de l'équipe. Ils nous ont conseillé plusieurs activités et facilité nos déplacements pendant le séjour.",
    messageFr: "Nous avons beaucoup apprécié la disponibilité de l'équipe. Ils nous ont conseillé plusieurs activités et facilité nos déplacements pendant le séjour.",
    rating: 4,
  },
  {
    name: "Hugo Lefèvre",
    dateAdded: new Date("2026-09-16"),
    photoUrl: "https://i.pravatar.cc/150?img=16",
    message: "Excellent rapport qualité-prix pour notre transfert privé. Chauffeur sympathique, voiture confortable et réservation très facile.",
    messageFr: "Excellent rapport qualité-prix pour notre transfert privé. Chauffeur sympathique, voiture confortable et réservation très facile.",
    rating: 5,
  },
  {
    name: "Youssef El Amrani",
    dateAdded: new Date("2026-09-12"),
    photoUrl: "https://i.pravatar.cc/150?img=68",
    message: "خدمة ممتازة من البداية حتى النهاية. السائق كان في الموعد والسيارة نظيفة ومريحة. تجربة رائعة في أكادير وأنصح بهم بكل تأكيد.",
    messageFr: "Excellent service du début à la fin. Le chauffeur était ponctuel et la voiture propre et confortable. Une très belle expérience à Agadir.",
    rating: 5,
  },
  {
    name: "Salma Benali",
    dateAdded: new Date("2026-09-08"),
    photoUrl: "https://i.pravatar.cc/150?img=25",
    message: "تجربة جميلة جداً! تعامل راقٍ وتنظيم ممتاز. سهلوا علينا التنقل من المطار إلى تاغازوت وكانت الرحلة مريحة جداً.",
    messageFr: "Une très belle expérience ! Un accueil professionnel et une excellente organisation. Le transfert de l'aéroport à Taghazout était très confortable.",
    rating: 5,
  },
  {
    name: "Omar Berrada",
    dateAdded: new Date("2026-09-04"),
    photoUrl: "https://i.pravatar.cc/150?img=60",
    message: "بصراحة خدمة تستحق التوصية. السائق محترم والالتزام بالوقت ممتاز. شكراً على حسن التعامل والخدمة الاحترافية.",
    messageFr: "Un service qui mérite vraiment d'être recommandé. Chauffeur respectueux et très ponctuel. Merci pour votre professionnalisme.",
    rating: 5,
  },
  {
    name: "Nadia El Fassi",
    dateAdded: new Date("2026-08-30"),
    photoUrl: "https://i.pravatar.cc/150?img=26",
    message: "كانت تجربة رائعة مع MH Traveling. ساعدونا في تنظيم التنقلات والأنشطة وكانت جميع التفاصيل واضحة وسهلة.",
    messageFr: "Une excellente expérience avec MH Traveling. Ils nous ont aidés à organiser les déplacements et les activités avec beaucoup de facilité.",
    rating: 5,
  },
  {
    name: "Mehdi Alaoui",
    dateAdded: new Date("2026-08-25"),
    photoUrl: "https://i.pravatar.cc/150?img=59",
    message: "تنظيم جيد جداً وخدمة مريحة. الرحلة من أكادير إلى الصويرة كانت ممتعة والسائق كان متعاوناً طوال الطريق.",
    messageFr: "Très bonne organisation et service confortable. Le trajet d'Agadir à Essaouira était agréable et le chauffeur très serviable.",
    rating: 5,
  },
  {
    name: "Imane Chraibi",
    dateAdded: new Date("2026-08-19"),
    photoUrl: "https://i.pravatar.cc/150?img=27",
    message: "شكراً على الخدمة الممتازة والاستقبال الجميل. كل شيء كان منظم بشكل جيد، من الاستقبال في المطار حتى الوصول إلى الفندق.",
    messageFr: "Merci pour cet excellent service et cet accueil chaleureux. Tout était bien organisé, de notre prise en charge à l'aéroport jusqu'à l'hôtel.",
    rating: 5,
  },
  {
    name: "Karim Mansouri",
    dateAdded: new Date("2026-08-12"),
    photoUrl: "https://i.pravatar.cc/150?img=61",
    message: "خدمة جيدة وسائق محترف. السيارة كانت مريحة والتواصل كان سهل طوال الرحلة. تجربة إيجابية بشكل عام.",
    messageFr: "Bon service et chauffeur professionnel. La voiture était confortable et la communication facile pendant tout le trajet.",
    rating: 4,
  },
];

async function main() {
  await prisma.customerReview.deleteMany({ where: { isDemo: true } });
  await prisma.customerReview.createMany({
    data: reviews.map((review) => ({
      ...review,
      isPublished: false,
      isDemo: true,
    })),
  });
  console.log(`Created ${reviews.length} bilingual demo reviews (unpublished).`);
}

main()
  .catch((error: unknown) => {
    console.error("Demo review seed failed.", error instanceof Error ? error.message : "Unknown error.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
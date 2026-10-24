import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  console.log('--- Starting migration to Firebase Cloud Firestore ---');
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const dbData = JSON.parse(fs.readFileSync('data/academic_portfolio_db.json', 'utf8'));
  console.log('Loaded database from disk.');

  // 1. Migrate profile
  console.log('1. Migrating profile to /academic_profile/profile...');
  await setDoc(doc(db, 'academic_profile', 'profile'), {
    ...dbData.profile,
    updatedAt: dbData.profile.updatedAt || new Date().toISOString()
  });
  console.log('Profile migrated successfully.');

  // 2. Migrate publications in batches of 100
  console.log(`2. Migrating ${dbData.publications.length} publications...`);
  const publications = dbData.publications || [];
  for (let i = 0; i < publications.length; i += 100) {
    const chunk = publications.slice(i, i + 100);
    const batch = writeBatch(db);
    for (const pub of chunk) {
      const pubDocRef = doc(db, 'publications', pub.id);
      batch.set(pubDocRef, pub);
    }
    await batch.commit();
    console.log(`Migrated publications ${i + 1} to ${Math.min(i + 100, publications.length)}`);
  }

  // 3. Migrate students
  console.log('3. Migrating students...');
  for (const s of (dbData.students || [])) {
    await setDoc(doc(db, 'students', s.id), s);
  }

  // 4. Migrate teaching
  console.log('4. Migrating teaching courses...');
  for (const t of (dbData.teaching || [])) {
    await setDoc(doc(db, 'teaching', t.id), t);
  }

  // 5. Migrate research topics
  console.log('5. Migrating research topics...');
  for (const rt of (dbData.researchTopics || [])) {
    await setDoc(doc(db, 'research_topics', rt.id), rt);
  }

  // 6. Migrate research projects
  console.log('6. Migrating research projects...');
  for (const rp of (dbData.researchProjects || [])) {
    await setDoc(doc(db, 'research_projects', rp.id), rp);
  }

  // 7. Migrate editorial roles
  console.log('7. Migrating editorial roles...');
  for (const er of (dbData.editorialRoles || [])) {
    await setDoc(doc(db, 'editorial_roles', er.id), er);
  }

  // 8. Migrate press media
  console.log('8. Migrating press media...');
  for (const pm of (dbData.pressMedia || [])) {
    await setDoc(doc(db, 'press_media', pm.id), pm);
  }

  // 9. Migrate blog posts
  console.log('9. Migrating blog posts...');
  for (const bp of (dbData.blogPosts || [])) {
    await setDoc(doc(db, 'blog_posts', bp.id), bp);
  }

  // 10. Bootstrap admins
  console.log('10. Bootstrapping admins...');
  const bootstrapAdmins = [
    {
      id: 'admin-muhammadraihanash',
      email: 'muhammadraihanash@student.uns.ac.id',
      namaLengkap: 'Muhammad Raihan Ash (Admin Pengembang UNS)',
      role: 'Super Administrator'
    },
    {
      id: 'admin-kurdhi',
      email: 'arfa@staff.uns.ac.id',
      namaLengkap: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
      role: 'Dosen Pemilik Portofolio (Administrator Utama)'
    }
  ];
  for (const adm of bootstrapAdmins) {
    await setDoc(doc(db, 'admins', adm.id), adm);
  }

  console.log('--- ALL DATA SUCCESSFULLY MIGRATED TO CLOUD FIRESTORE ---');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

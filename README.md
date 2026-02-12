# To-Do List

Google Play: <a href="https://expo.dev/accounts/ozann.yllmaz/projects/todo" target="_blank">Başlat</a><br /><br />
<img width="1024" height="500" alt="play store" src="https://github.com/user-attachments/assets/804381a2-b99c-4202-9e8f-84bbfc6c0134" />


<br />


**To-Do List**, günlük görevlerinizi düzenli bir şekilde yönetmenizi sağlayan, sade ve kullanışlı bir **mobil uygulamadır.**  
Kullanıcı dostu arayüzüyle yapılacaklarınızı kolayca ekleyebilir, tamamlayabilir veya silebilirsiniz.  
Görevler, **Local Storage** aracılığıyla kaydedilir, böylece uygulama kapansa bile verileriniz korunur.


🚀 Öne Çıkan Özellikler

- ✏️ Yeni görev ekleme  
- ✅ Görevleri tamamlandı olarak işaretleme  
- 🗑️ Görevleri silme  
- 💾 Local Storage ile kalıcı veri saklama  
- 📱 Basit, kullanıcı dostu ve modern arayüz  


⚙️ Uygulama İşlevi

To-Do List, kullanıcıların günlük planlarını kolayca takip etmelerine yardımcı olur.  
Görevlerinizi ekleyebilir, tamamlayabilir, silebilir ve takvim üzerinden planlayabilirsiniz.  

Aşağıdaki temel adımlar ile kullanılabilir:

1. Yeni yapılacak görevi ekleyin  
2. Tamamladığınız görevleri işaretleyin  
3. Artık gerekmeyen görevleri silin  
4. Takvim özelliği sayesinde görevlerinizi belirli bir güne planlayın  
5. Uygulamayı kapatsanız bile görevleriniz Local Storage sayesinde saklanır  


Teknolojiler

- React Native  
- Expo  
- AsyncStorage (Local Storage)


İletişim

Geliştirici: Ozan Yılmaz  
📧 E-posta: **ozany1542@gmail.com**  
🔗 LinkedIn: <a href="https://www.linkedin.com/in/ozan-yilmaz-338b802a8" target="_blank">in/ozan-yilmaz-338b802a8</a>  

© 2025 To-Do List  


📸 Ekran Görüntüleri

<div class="shots">
  <img class="shot" src="https://github.com/user-attachments/assets/b66cbaf1-1027-4d96-bfb9-deebfe4daa59" alt="1" />
  <img class="shot" src="https://github.com/user-attachments/assets/dd798733-21cc-46ef-ba46-2e44b44bffe8" alt="2" />
  <img class="shot" src="https://github.com/user-attachments/assets/d1076617-b8ee-43d6-9258-1461fc8dfc9e" alt="3" />
  <img class="shot" src="https://github.com/user-attachments/assets/60e4d7af-b4bd-4724-b471-413a0039875d" alt="4" />
  <img class="shot" src="https://github.com/user-attachments/assets/adb07403-0f89-45d5-835f-29839527693c" alt="5" />
  <img class="shot" src="https://github.com/user-attachments/assets/ff57ea55-0993-4ef0-9692-9d28b4191921" alt="6" />
  <img class="shot" src="https://github.com/user-attachments/assets/b8e6e1cc-3cd5-4f3d-bcf9-51d448c9ad4a" alt="7" />
</div>

<style>
  .shots {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
  }

  .shot {
    width: calc(25% - 12px); /* 4'lü */
    max-width: 280px;        /* istersen sınır koy */
    height: auto;
    border-radius: 12px;
  }

  /* tablet/orta ekran: 2'li */
  @media (max-width: 900px) {
    .shot { width: calc(50% - 12px); }
  }

  /* küçük ekran: 1'li */
  @media (max-width: 520px) {
    .shot { width: 100%; }
  }
</style>

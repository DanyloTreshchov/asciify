import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'asciify';

  constructor() { }

  asciify() {
    console.log("asciify");
    //Get the input image
    let image = document.getElementById("image-selector") as HTMLInputElement;
    if (image == null) {
      return;
    }
    let file = image?.files?.[0];
    if (file == null) {
      return;
    }
    //Get font-size value from radio buttons
    let radios = document.getElementsByName("font-size");
    let font_size = 12;
    for (let i = 0; i < radios.length; i++) {
      if ((radios[i] as HTMLInputElement).checked) {
        font_size = parseInt((radios[i] as HTMLInputElement).value);
      }
    }
    let h = 8;
    let w = 5;
    switch (font_size) {
      case 8:
        h = 8;
        h = 5;
        break;
      case 16:
        h = 16;
        w = 10;
        break;
      case 32:
        h = 32;
        w = 20;
        break;
      default:
        break;
    }

    console.log("font-size: " + font_size);
    console.log("image: " + file.name);
    console.log("Encoding image...");
    this.b64EncodeImage(file).then((data) => {
      console.log("Image encoded");
      console.log("Sending image to server...");
      this.processImage(data, h, w).then((data) => {
        console.log("Image sent to server");
        console.log("Receiving ASCII image...");
        this.displayImage(data);
      });
    });
  }

  b64EncodeImage(image: any) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        let dataUrl = reader.result;
        let base64 = dataUrl ? (dataUrl as string).split(',')[1] : null;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });
  }

  processImage(data: any, h: number, w: number) {
    let url = "https://europe-west1-vast-arena-424819-f6.cloudfunctions.net/image_convertor";
    let payload = {
      image: data,
      w: w,
      h: h
    };
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).then(response => response.json())
    .then(data => {
      return data;
    });
  }

  displayImage(data: any) {
    let ascii_image = document.getElementById("image-container");
    if (ascii_image == null) {
      return;
    }
    let b64 = data.image;
    //decode base64 image
    let img = new Image();
    img.src = "data:image/png;base64," + b64;
    //Set image
    ascii_image.innerHTML = "";
    ascii_image.appendChild(img);

    //display ascii image
    let ascii = data.text;
    let ascii_text = document.createElement("pre");
    ascii_text.innerHTML = ascii;
    ascii_image.appendChild(ascii_text);
  }
}
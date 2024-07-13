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
    let button = document.getElementById("asciify-button");
    if (button == null) {
      return;
    }

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
    let font_size = 8;
    let radios = document.getElementsByName("font-size");
    for (let i = 0; i < radios.length; i++) {
      if ((radios[i] as HTMLInputElement).checked) {
        font_size = parseInt((radios[i] as HTMLInputElement).value);
        break;
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

    //Get colorize value from radio buttons (t/f)
    let colorize = "false";
    let radios_colorize = document.getElementsByName("mode");
    for (let i = 0; i < radios_colorize.length; i++) {
      if ((radios_colorize[i] as HTMLInputElement).checked) {
        colorize = (radios_colorize[i] as HTMLInputElement).value;
        break;
      }
    }
    colorize = colorize == "true" ? "true" : "false";
    console.log("font-size: " + font_size);
    console.log("image: " + file.name);
    console.log("colorize: " + colorize);
    console.log("Encoding image...");
    button.innerHTML = "Processing...";
    this.b64EncodeImage(file).then((data) => {
      console.log("Image encoded");
      console.log("Sending image to server...");
      this.processImage(data, h, w, colorize).then((data) => {
        console.log("Image sent to server");
        console.log("Receiving ASCII image...");
        this.displayImage(data);
        button.innerHTML = "Asciify";
      }).catch((error) => {
        console.log("Error: " + error);
        button.innerHTML = "Asciify";
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

  processImage(data: any, h: number, w: number, colorize: string = "false") {
    let url = "https://europe-west1-vast-arena-424819-f6.cloudfunctions.net/image_convertor";
    let payload = {
      image: data,
      w: w,
      h: h,
      bg: [50, 22, 61],
      tc: [253, 15, 70],
      colorized: colorize
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

  CDButtons(image: any, text: any){
    //Create download button for image
    let download = document.createElement("a");
    download.innerHTML = "Download";
    download.href = URL.createObjectURL(image);
    download.download = "ascii_image.png";
    download.id = "download";

    //Create copy button for text
    let copy = document.createElement("button");
    copy.innerHTML = "Copy";
    copy.onclick = () => {
      navigator.clipboard.writeText(text).then(() => {
        console.log("Text copied to clipboard");
      }).catch((error) => {
        console.log("Error: " + error);
      });
    };
    copy.id = "copy";

    //Add buttons to container
    let container = document.getElementById("button-container");
    if (container == null) {
      return;
    }
    container.innerHTML = "";
    container.appendChild(download);
    container.appendChild(copy);
  }

  displayImage(data: any) {
    let ascii_image = document.getElementById("image-container");
    if (ascii_image == null) {
      return;
    }
    let b64 = data.image;
    //convert b64 to file
    let byteString = atob(b64);
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ab], { type: 'image/png' });
    this.setImages(blob);
    this.CDButtons(blob, data.text);
  }

  handleImageSelect(event: any) {
    console.log("handleImageSelect");
    let image = document.getElementById("image-selector") as HTMLInputElement;
    if (image == null) {
      console.log("image is null");
      return;
    }
    let file = image?.files?.[0];
    if (file == null) {
      console.log("file is null");
      return;
    }
    //get label
    let label = document.getElementById("image-label") as HTMLLabelElement;
    label.innerHTML = file.name;
    this.setImages(file);
  }

  setImages(image: any) {
    if (image == null) {
      console.log("file is null");
      return;
    }
    let img_container = document.getElementById("image-container") as HTMLImageElement;
    if (img_container == null) {
      console.log("img is null");
      return;
    }
    let img = new Image();
    img.src = URL.createObjectURL(image);
    img.style.objectFit = "contain";
    img.style.width = "100%";
    img.style.height = "100%";
    img_container.innerHTML = "";
    img_container.appendChild(img);
  }
}
# web

## Canvas

*Experimental*

The Canvas API follows the structure of building shapes through the AST, then internally calling the appropriate draw method for each shape.

At the moment only basic Rects are supported, but other shapes can be added easily. Pull requests are most welcome.

Usage typically involves getting the canvas element from the dom, constructing the shapes needed, then calling the canvas draw method. At the moment it is best to call it during update as part of a frequent `Tick` event. Note that changing the properties of the canvas `HtmlNode` will cause the DOM to re-render it, in which case you'll need to call the canvas rendering functions again.

```elm

update: Msg -> Model -> (Msg -> void) -> Model
update msg model send =
    case msg of
        Tick ->
            let
                canvasRoot: any
                canvasRoot =
                    document.getElementById "canvas"

                aRect: Shape
                aRect =
                    Rect { x: 0, y: 0, width: 50, height: 50, color: "#FF0" }

                drawn: void
                drawn =
                    Canvas.draw { canvas: canvasRoot } aRect

                nextTick: void
                nextTick =
                    Task.after (\_ -> send Tick) 3000
            in
                model

view: Model -> HtmlNode Msg
view model =
    Html.canvas [] [ attribute "id" "canvas", attribute "width" "500", attribute "height" "500" ] []

```

## FileReader

*Experimental*

Currently the `FileReader` API only supports converting files passed from events into base64, for example images.

`base64` takes the file object and a callback for when the base64 encoding is done.

```elm
type Msg = UploadPicture { file: File } | InsertPicture { binary: string }

uploadPicture: Event -> Msg
uploadPicture event =
    UploadPicture {
        file: event.target.files[0]
    }

update: Msg -> Model -> (Msg -> void) -> Model
update msg model send =
    case msg of
        UploadPicture { file } ->
            let
                base64: void
                base64 =
                    FileReader.toBase64 file (\encoded -> send (InsertPicture { binary: encoded } ) )
            in
                model

        InsertPicture { binary } ->
            { ...model, picture: binary }

view: Model -> HtmlNode Msg
view model =
    div [ on "change" uploadPicture ] [ attribute "id" "file-take" ] [
        Html.label [ ] [ attribute "for" "take-a-picture" ] [ text "Take a picture: " ],
        Html.input [ ] [
            attribute "id" "take-a-picture",
            attribute "type" "file",
            attribute "capture" "file"
        ]
    ]
```

## Geolocation

## History

## IndexedDB

## LocalStorage
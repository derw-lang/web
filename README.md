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

Geolocation has two main ways of usage: request geolocation on demand, for example after clicking a button or loading a page. Or to continiously watch the geolocation. In Derw both of these uses are achieved via the `send` command.

```elm
main: RunningProgram Msg Model
main =
    { initialModel, view, update, root }

watch: WatcherId
watch =
    Geolocation.watchPosition (\pos -> main.send (GotPosition { position: pos })) (\_ -> main.send ErrorLoadingGeoLocation)
```


```elm
update: Msg -> Model -> (Msg -> void) -> Model
update msg model send =
    case msg of
        GetPositionButtonClicked ->
            let
                getPosition: void
                getPosition =
                    Geolocation.getCurrentPosition (\pos -> main.send (GotPosition { position: pos })) (\_ -> main.send ErrorLoadingGeoLocation)
            in
                model
```

## History

```elm
type PageMode = Home | Settings

serializePageMode: PageMode -> string
serializePageMode pageMode =
    case PageMode of
        Home -> "home"

        Settings -> "settings"

pushPageMode: PageMode -> void
pushPageMode pageMode =
    serializePageMode pageMode
        |> History.pushState
```

## IndexedDB

*experimental*

IndexedDB support works for storing and loading files by their name, as well as deleting them.

```elm
photoRow: Row
photoRow =
    Row { fields: [
        Field {
            name: "name",
            value: ""
        },
        Field {
            name: "binary",
            value: ""
        }
    ] }

photoTable: Table
photoTable =
    Table {
        name: "photos",
        key: "name",
        row: photoRow
    }

photoRowFromPicture: LocationPicture -> Row
photoRowFromPicture picture =
    Row { fields: [
        Field {
            name: "name",
            value: picture.name
        },
        Field {
            name: "binary",
            value: picture.binary
        }
    ] }

pictureFromPhotoRow: Row -> Maybe LocationPicture
pictureFromPhotoRow row =
    let
        name: Maybe string
        name =
            IndexedDB.getField (Field {
                name: "name",
                value: ""
            }) row
                |> map (\field -> field.value)

        binary: Maybe string
        binary =
            IndexedDB.getField (Field {
                name: "binary",
                value: ""
            }) row
                |> map (\field -> field.value)
    in
        case [
            name,
            binary
        ] of
            Just { value: name } :: Just { value: binary } :: rest ->
                Just { value: {
                    name: name,
                    binary: binary
                } }

            default ->
                Nothing

photoName: string -> Field
photoName name =
    Field {
        name: "name",
        value: name
    }

update: Msg -> Model -> (Msg -> void) -> Model
update msg model send =
    case msg of
        LoadDatabase ->
            let
                sendDatabase: Database -> void
                sendDatabase database =
                    send (DatabaseLoaded { database: database })

                opener: void
                opener =
                    IndexedDB.open databaseName photoTable sendDatabase
            in
                model

        DatabaseLoaded { database } ->
            let
                fetchAll: void
                fetchAll =
                    IndexedDB.fetchAll database photoTable (\rows -> send (RowsFetched { rows: rows }))
            in
                { ...model, database: Just { value: database } }

        RowsFetched { rows } ->
            rows
                |> List.filterMap pictureFromPhotoRow
                |> (\x ->
                    {
                        ...model,
                        locationPictures: x
                    }
                )

        DeleteRow { picture } ->
            let
                deleter: void
                deleter =
                    case model.database of
                        Nothing ->
                            null

                        Just { value } ->
                            IndexedDB.deleteOne value photoTable (photoName picture.name) (\_ -> send RowDeleted)
            in
                model

        RowDeleted ->
            let
                reload: void
                reload =
                    send FetchAll
            in
                model

        FetchAll ->
            let
                fetcher: void
                fetcher =
                    case model.database of
                        Nothing ->
                            null

                        Just { value } ->
                            IndexedDB.fetchAll value photoTable (\rows -> send (RowsFetched { rows: rows }))
            in
                model
```

## LocalStorage

See example in offsite-bingo: https://github.com/derw-lang/examples/blob/main/offsite-bingo/src/Main.derw
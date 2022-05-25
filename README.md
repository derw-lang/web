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

## Geolocation

## History

## IndexedDB

## LocalStorage
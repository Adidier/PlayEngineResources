#version 400

in vec2 TexCoord;
in vec3 FragPos;
in vec3 Normal1;

layout( location = 0 ) out vec4 FragColor;
uniform sampler2D RenderTex;
uniform sampler2D tex;
uniform sampler2D normalMap;  
// The texture containing the results of the first pass

// uniform float EdgeThreshold; // T
// uniform int Width; // The pixel width
// uniform int Height; // The pixel height
// This subroutine is used for selecting the functionality
// of pass1 and pass2.
subroutine vec4 RenderPassType();
subroutine uniform RenderPassType RenderPass;
// Other uniform variables for the Phong reflection model can
// be placed here…

vec3 phongModel( vec3 myPosition, vec3 myNormal )
{
	const vec3 myLightPosition = vec3( 0.2, 0.2, 0.2 );
	const vec3 myLightAmbient = vec3( 0.2, 0.2, 0.2 );
	const vec3 myLightDiffuse = vec3( 1.0 , 1.0 , 1.0 );
	const vec3 myLightSpecular = vec3( 1.0 , 1.0 , 1.0 );
	const vec3 myMaterialAmbient = vec3( 1.0 , 0.5, 0.0 );
	const vec3 myMaterialDiffuse = vec3( 1.0 , 0.5, 0.0 );
	const vec3 myMaterialSpecular = vec3( 0.6, 0.6, 0.6 );
	const float myMaterialShininess = 1.0;
	//normal, light, view, and light reflection vectors
	vec3 norm = normalize( myNormal );
	vec3 lightv = normalize( myLightPosition - myPosition);
	vec3 viewv = normalize( vec3(0.,0.,0.) - myPosition );
	vec3 refl = reflect( vec3(0.,0.,0.) - lightv, norm );
	//ambient light computation
	vec3 ambient = myMaterialAmbient*myLightAmbient;
	//diffuse light computation
	vec3 diffuse = max(0.0, dot(lightv, norm)) * myMaterialDiffuse *myLightDiffuse;
	//Optionally you can add a diffuse attenuation term at this
	//specular light computation
	vec3 specular = vec3( 0.0, 0.0, 0.0 );
	if( dot(lightv, viewv) > 0.0)
	{
	 specular = pow(max(0.0, dot(viewv,refl)), myMaterialShininess)*myMaterialSpecular*	myLightSpecular;
	}
	return clamp( ambient + diffuse + specular, 0.0, 1.0);
}

// Approximates the brightness of a RGB value.
float luma( vec3 color ) {
 return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}


// Pass #1
subroutine (RenderPassType)
vec4 pass1()
{
 return vec4(phongModel( FragPos, Normal1 ),1.0);
}
// Pass #2
subroutine( RenderPassType )
vec4 pass2()
{
	int Width= 1024;
	int Height= 1024;
	float EdgeThreshold = 0.1;
	float dx = 1.0 / float(Width);
	float dy = 1.0 / float(Height);
	float s00 = luma(texture( RenderTex, TexCoord + vec2(-dx,dy) ).rgb);
	float s10 = luma(texture( RenderTex, TexCoord + vec2(-dx,0.0) ).rgb);
	float s20 = luma(texture( RenderTex, TexCoord + vec2(-dx,-dy) ).rgb);
	float s01 = luma(texture( RenderTex, TexCoord + vec2(0.0,dy) ).rgb);
	float s21 = luma(texture( RenderTex, TexCoord + vec2(0.0,-dy) ).rgb);
	float s02 = luma(texture( RenderTex, TexCoord + vec2(dx, dy) ).rgb);
	float s12 = luma(texture( RenderTex, TexCoord + vec2(dx, 0.0) ).rgb);
	float s22 = luma(texture( RenderTex, TexCoord + vec2(dx, -dy) ).rgb);
	float sx = s00 + 2 * s10 + s20 - (s02 + 2 * s12 + s22);
	float sy = s00 + 2 * s01 + s02 - (s20 + 2 * s21 + s22);
	float dist = sx * sx + sy * sy;
	if( dist>EdgeThreshold )
	return vec4(1.0);
	else
	return vec4(0.0,0.0,0.0,1.0);
}
void main()
{
 // This will call either pass1() or pass2()
 FragColor =  RenderPass();
}
